/**
 * Simulator Battle
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * @license MIT
 */
import Dex = require('./dex');
global.toId = Dex.getId;
import * as Data from './dex-data';
import {Field} from './field';
import {Pokemon} from './pokemon';
import {PRNG, PRNGSeed} from './prng';
import {Side} from './side';

/** A Pokemon that has fainted. */
interface FaintedPokemon {
	target: Pokemon;
	source: Pokemon | null;
	effect: Effect | null;
}

interface BattleOptions {
	formatid: string; // Format ID
	send?: (type: string, data: string | string[]) => void; // Output callback
	prng?: PRNG; // PRNG override (you usually don't need this, just pass a seed)
	seed?: PRNGSeed; // PRNG seed
	rated?: boolean | string; // Rated string
	p1?: PlayerOptions; // Player 1 data
	p2?: PlayerOptions; // Player 2 data
	p3?: PlayerOptions; // Player 3 data
	p4?: PlayerOptions; // Player 4 data
	debug?: boolean; // show debug mode option
	strictChoices?: boolean; // whether invalid choices should throw
}

// The current request state of the Battle:
//
//   - 'teampreview': beginning of BW/XY/SM battle (Team Preview)
//   - 'move': beginning of each turn
//   - 'switch': end of turn if fainted (or mid turn with switching effects)
//   - '': no request. Used between turns, or when the battle is over.
//
// An individual Side's request state is encapsulated in its `activeRequest` field.
export type RequestState = 'teampreview' | 'move' | 'switch' | '';

export class Battle extends Dex.ModdedDex {
	readonly id: '';
	readonly debugMode: boolean;
	readonly strictChoices: boolean;
	readonly format: string;
	readonly formatData: AnyObject;
	readonly cachedFormat: Format;
	readonly gameType: GameType;
	readonly field: Field;
	readonly sides: [Side, Side] | [Side, Side, Side, Side];
	readonly prngSeed: PRNGSeed;
	prng: PRNG;
	rated: boolean | string;
	reportExactHP: boolean;
	reportPercentages: boolean;
	supportCancel: boolean;

	queue: Actions["Action"][];
	readonly faintQueue: FaintedPokemon[];

	readonly log: string[];
	readonly inputLog: string[];
	readonly messageLog: string[];
	sentLogPos: number;
	sentEnd: boolean;

	requestState: RequestState;
	turn: number;
	midTurn: boolean;
	started: boolean;
	ended: boolean;
	winner?: string;

	effect: Effect;
	effectData: AnyObject;

	event: AnyObject;
	events: AnyObject | null;
	eventDepth: number;

	activeMove: ActiveMove | null;
	activePokemon: Pokemon | null;
	activeTarget: Pokemon | null;

	lastMove: Move | null;
	lastMoveLine: number;
	lastDamage: number;
	abilityOrder: number;

	teamGenerator: ReturnType<typeof Dex.getTeamGenerator> | null;

	firstStaleWarned?: boolean;
	staleWarned?: boolean;

	readonly hints: Set<string>;

	readonly zMoveTable: {[k: string]: string};

	readonly NOT_FAIL: '';
	readonly FAIL: false;
	readonly SILENT_FAIL: null;

	readonly send: (type: string, data: string | string[]) => void;

	constructor(options: BattleOptions) {
		const format = Dex.getFormat(options.formatid, true);
		super(format.mod);

		this.zMoveTable = {};
		Object.assign(this, this.data.Scripts);

		this.id = '';
		this.debugMode = format.debug || !!options.debug;
		this.strictChoices = !!options.strictChoices;
		this.format = format.id;
		this.formatData = {id: format.id};
		this.cachedFormat = format;
		this.gameType = (format.gameType || 'singles');
		this.field = new Field(this);
		const isFourPlayer = this.gameType === 'multi' || this.gameType === 'free-for-all';
		// @ts-ignore
		this.sides = Array(isFourPlayer ? 4 : 2).fill(null!);
		this.prng = options.prng || new PRNG(options.seed || undefined);
		this.prngSeed = this.prng.startingSeed.slice() as PRNGSeed;
		this.rated = options.rated || !!options.rated;
		this.reportExactHP = !!format.debug;
		this.reportPercentages = false;
		this.supportCancel = false;

		this.queue = [];
		this.faintQueue = [];

		this.log = [];
		this.inputLog = [];
		this.messageLog = [];
		this.sentLogPos = 0;
		this.sentEnd = false;

		this.requestState = '';
		this.turn = 0;
		this.midTurn = false;
		this.started = false;
		this.ended = false;

		// tslint:disable-next-line:no-object-literal-type-assertion
		this.effect = {id: ''} as Effect;
		this.effectData = {id: ''};

		this.event = {id: ''};
		this.events = null;
		this.eventDepth = 0;

		this.activeMove = null;
		this.activePokemon = null;
		this.activeTarget = null;

		this.lastMove = null;
		this.lastMoveLine = -1;
		this.lastDamage = 0;
		this.abilityOrder = 0;

		this.teamGenerator = null;

		this.hints = new Set();

		this.NOT_FAIL = '';
		this.FAIL = false;
		this.SILENT_FAIL = null;

		this.send = options.send || (() => {});

		// bound function for faster speedSort
		// (so speedSort doesn't need to bind before use)
		this.comparePriority = this.comparePriority.bind(this);

		const inputOptions: {formatid: string, seed: PRNGSeed, rated?: string | true} = {
			formatid: options.formatid, seed: this.prng.seed,
		};
		if (this.rated) inputOptions.rated = this.rated;
		if (global.__version) {
			this.inputLog.push(`>version ${global.__version}`);
		}
		this.inputLog.push(`>start ` + JSON.stringify(inputOptions));

		for (const rule of this.getRuleTable(format).keys()) {
			if (rule.startsWith('+') || rule.startsWith('-') || rule.startsWith('!')) continue;
			const subFormat = this.getFormat(rule);
			if (subFormat.exists) {
				const hasEventHandler = Object.keys(subFormat).some(val =>
					val.startsWith('on') && !['onBegin', 'onValidateTeam', 'onChangeSet', 'onValidateSet'].includes(val)
				);
				if (hasEventHandler) this.field.addPseudoWeather(rule);
			}
		}
		const sides: SideID[] = ['p1', 'p2', 'p3', 'p4'];
		for (const side of sides) {
			if (options[side]) {
				this.setPlayer(side, options[side]!);
			}
		}
	}

	get p1() {
		return this.sides[0];
	}

	get p2() {
		return this.sides[1];
	}

	toString() {
		return `Battle: ${this.format}`;
	}

	random(m?: number, n?: number) {
		return this.prng.next(m, n);
	}

	randomChance(numerator: number, denominator: number) {
		return this.prng.randomChance(numerator, denominator);
	}

	sample<T>(items: ReadonlyArray<T>): T {
		return this.prng.sample(items);
	}

	resetRNG() {
		this.prng = new PRNG(this.prng.startingSeed);
	}

	getFormat(format?: string) {
		return format ? super.getFormat(format, true) : this.cachedFormat;
	}

	suppressingAttackEvents() {
		return this.activePokemon && this.activePokemon.isActive && this.activeMove && this.activeMove.ignoreAbility;
	}

	setActiveMove(move?: ActiveMove | null, pokemon?: Pokemon | null, target?: Pokemon | null) {
		this.activeMove = move || null;
		this.activePokemon = pokemon || null;
		this.activeTarget = target || pokemon || null;
	}

	clearActiveMove(failed?: boolean) {
		if (this.activeMove) {
			if (!failed) this.lastMove = this.activeMove;
			this.activeMove = null;
			this.activePokemon = null;
			this.activeTarget = null;
		}
	}

	updateSpeed() {
		for (const pokemon of this.getAllActive()) {
			pokemon.updateSpeed();
		}
	}

	comparePriority(a: AnyObject, b: AnyObject) {
		return -((b.order || 4294967296) - (a.order || 4294967296)) ||
			((b.priority || 0) - (a.priority || 0)) ||
			((b.speed || 0) - (a.speed || 0)) ||
			-((b.subOrder || 0) - (a.subOrder || 0)) ||
			((a.thing && b.thing) ? -(b.thing.abilityOrder - a.thing.abilityOrder) : 0) ||
			0;
	}

	static compareRedirectOrder(a: AnyObject, b: AnyObject) {
		return ((b.priority || 0) - (a.priority || 0)) ||
			((b.speed || 0) - (a.speed || 0)) ||
			((a.thing && b.thing) ? -(b.thing.abilityOrder - a.thing.abilityOrder) : 0) ||
			0;
	}

	static compareLeftToRightOrder(a: AnyObject, b: AnyObject) {
		return -((b.order || 4294967296) - (a.order || 4294967296)) ||
			((b.priority || 0) - (a.priority || 0)) ||
			-((b.index || 0) - (a.index || 0)) ||
			0;
	}

	/** Sort a list, resolving speed ties the way the games do. */
	speedSort<T>(list: T[], comparator: (a: T, b: T) => number = this.comparePriority) {
		if (list.length < 2) return;
		let sorted = 0;
		while (sorted + 1 < list.length) {
			let nextIndexes = [sorted];
			// grab list of next indexes
			for (let i = sorted + 1; i < list.length; i++) {
				const delta = comparator(list[nextIndexes[0]], list[i]);
				if (delta < 0) continue;
				if (delta > 0) nextIndexes = [i];
				if (delta === 0) nextIndexes.push(i);
			}
			// put list of next indexes where they belong
			const nextCount = nextIndexes.length;
			for (let i = 0; i < nextCount; i++) {
				let index = nextIndexes[i];
				while (index > sorted + i) {
					[list[index], list[index - 1]] = [list[index - 1], list[index]];
					index--;
				}
			}
			if (nextCount > 1) this.prng.shuffle(list, sorted, sorted + nextCount);
			sorted += nextCount;
		}
	}

	eachEvent(eventid: string, effect?: Effect, relayVar?: boolean) {
		const actives = this.getAllActive();
		if (!effect && this.effect) effect = this.effect;
		this.speedSort(actives, (a, b) => b.speed - a.speed);
		for (const pokemon of actives) {
			this.runEvent(eventid, pokemon, null, effect, relayVar);
		}
		if (eventid === 'Weather' && this.gen >= 7) {
			// TODO: further research when updates happen
			this.eachEvent('Update');
		}
	}

	residualEvent(eventid: string, relayVar?: any) {
		const callbackName = `on${eventid}`;
		let handlers = this.findBattleEventHandlers(callbackName, 'duration');
		handlers = handlers.concat(this.findFieldEventHandlers(this.field, callbackName, 'duration'));
		for (const side of this.sides) {
			handlers = handlers.concat(this.findSideEventHandlers(side, callbackName, 'duration'));
			for (const active of side.active) {
				if (!active) continue;
				handlers = handlers.concat(this.findPokemonEventHandlers(active, callbackName, 'duration'));
			}
		}
		this.speedSort(handlers);
		while (handlers.length) {
			const handler = handlers[0];
			handlers.shift();
			const status = handler.status;
			if (handler.thing.fainted) continue;
			if (handler.statusData && handler.statusData.duration) {
				handler.statusData.duration--;
				if (!handler.statusData.duration) {
					const endCallArgs = handler.endCallArgs || [handler.thing, status.id];
					handler.end.call(...endCallArgs);
					continue;
				}
			}
			this.singleEvent(eventid, status, handler.statusData, handler.thing, relayVar);
			this.faintMessages();
			if (this.ended) return;
		}
	}

	/** The entire event system revolves around this function and runEvent. */
	singleEvent(
		eventid: string, effect: Effect, effectData: AnyObject | null,
		target: string | Pokemon | Side | Field | Battle | null, source?: string | Pokemon | Effect | false | null,
		sourceEffect?: Effect | string | null, relayVar?: any) {
		if (this.eventDepth >= 8) {
			// oh fuck
			this.add('message', 'STACK LIMIT EXCEEDED');
			this.add('message', 'PLEASE REPORT IN BUG THREAD');
			this.add('message', 'Event: ' + eventid);
			this.add('message', 'Parent event: ' + this.event.id);
			throw new Error("Stack overflow");
		}
		// this.add('Event: ' + eventid + ' (depth ' + this.eventDepth + ')');
		let hasRelayVar = true;
		if (relayVar === undefined) {
			relayVar = true;
			hasRelayVar = false;
		}

		if (effect.effectType === 'Status' && (target instanceof Pokemon) && target.status !== effect.id) {
			// it's changed; call it off
			return relayVar;
		}
		if (eventid !== 'Start' && eventid !== 'TakeItem' && eventid !== 'Primal' &&
			effect.effectType === 'Item' && (target instanceof Pokemon) && target.ignoringItem()) {
			this.debug(eventid + ' handler suppressed by Embargo, Klutz or Magic Room');
			return relayVar;
		}
		if (eventid !== 'End' && effect.effectType === 'Ability' && (target instanceof Pokemon) && target.ignoringAbility()) {
			this.debug(eventid + ' handler suppressed by Gastro Acid');
			return relayVar;
		}
		if (effect.effectType === 'Weather' && eventid !== 'Start' && eventid !== 'Residual' &&
			eventid !== 'End' && this.field.suppressingWeather()) {
			this.debug(eventid + ' handler suppressed by Air Lock');
			return relayVar;
		}

		// @ts-ignore - dynamic lookup
		const callback = effect[`on${eventid}`];
		if (callback === undefined) return relayVar;

		const parentEffect = this.effect;
		const parentEffectData = this.effectData;
		const parentEvent = this.event;

		this.effect = effect;
		this.effectData = effectData || {};
		this.event = {id: eventid, target, source, effect: sourceEffect};
		this.eventDepth++;

		const args = [target, source, sourceEffect];
		if (hasRelayVar) args.unshift(relayVar);

		let returnVal;
		if (typeof callback === 'function') {
			returnVal = callback.apply(this, args);
		} else {
			returnVal = callback;
		}

		this.eventDepth--;
		this.effect = parentEffect;
		this.effectData = parentEffectData;
		this.event = parentEvent;

		return returnVal === undefined ? relayVar : returnVal;
	}

	/**
	 * runEvent is the core of Pokemon Showdown's event system.
	 *
	 * Basic usage
	 * ===========
	 *
	 *   this.runEvent('Blah')
	 * will trigger any onBlah global event handlers.
	 *
	 *   this.runEvent('Blah', target)
	 * will additionally trigger any onBlah handlers on the target, onAllyBlah
	 * handlers on any active pokemon on the target's team, and onFoeBlah
	 * handlers on any active pokemon on the target's foe's team
	 *
	 *   this.runEvent('Blah', target, source)
	 * will additionally trigger any onSourceBlah handlers on the source
	 *
	 *   this.runEvent('Blah', target, source, effect)
	 * will additionally pass the effect onto all event handlers triggered
	 *
	 *   this.runEvent('Blah', target, source, effect, relayVar)
	 * will additionally pass the relayVar as the first argument along all event
	 * handlers
	 *
	 * You may leave any of these null. For instance, if you have a relayVar but
	 * no source or effect:
	 *   this.runEvent('Damage', target, null, null, 50)
	 *
	 * Event handlers
	 * ==============
	 *
	 * Items, abilities, statuses, and other effects like SR, confusion, weather,
	 * or Trick Room can have event handlers. Event handlers are functions that
	 * can modify what happens during an event.
	 *
	 * event handlers are passed:
	 *   function (target, source, effect)
	 * although some of these can be blank.
	 *
	 * certain events have a relay variable, in which case they're passed:
	 *   function (relayVar, target, source, effect)
	 *
	 * Relay variables are variables that give additional information about the
	 * event. For instance, the damage event has a relayVar which is the amount
	 * of damage dealt.
	 *
	 * If a relay variable isn't passed to runEvent, there will still be a secret
	 * relayVar defaulting to `true`, but it won't get passed to any event
	 * handlers.
	 *
	 * After an event handler is run, its return value helps determine what
	 * happens next:
	 * 1. If the return value isn't `undefined`, relayVar is set to the return
	 *    value
	 * 2. If relayVar is falsy, no more event handlers are run
	 * 3. Otherwise, if there are more event handlers, the next one is run and
	 *    we go back to step 1.
	 * 4. Once all event handlers are run (or one of them results in a falsy
	 *    relayVar), relayVar is returned by runEvent
	 *
	 * As a shortcut, an event handler that isn't a function will be interpreted
	 * as a function that returns that value.
	 *
	 * You can have return values mean whatever you like, but in general, we
	 * follow the convention that returning `false` or `null` means
	 * stopping or interrupting the event.
	 *
	 * For instance, returning `false` from a TrySetStatus handler means that
	 * the pokemon doesn't get statused.
	 *
	 * If a failed event usually results in a message like "But it failed!"
	 * or "It had no effect!", returning `null` will suppress that message and
	 * returning `false` will display it. Returning `null` is useful if your
	 * event handler already gave its own custom failure message.
	 *
	 * Returning `undefined` means "don't change anything" or "keep going".
	 * A function that does nothing but return `undefined` is the equivalent
	 * of not having an event handler at all.
	 *
	 * Returning a value means that that value is the new `relayVar`. For
	 * instance, if a Damage event handler returns 50, the damage event
	 * will deal 50 damage instead of whatever it was going to deal before.
	 *
	 * Useful values
	 * =============
	 *
	 * In addition to all the methods and attributes of Dex, Battle, and
	 * Scripts, event handlers have some additional values they can access:
	 *
	 * this.effect:
	 *   the Effect having the event handler
	 * this.effectData:
	 *   the data store associated with the above Effect. This is a plain Object
	 *   and you can use it to store data for later event handlers.
	 * this.effectData.target:
	 *   the Pokemon, Side, or Battle that the event handler's effect was
	 *   attached to.
	 * this.event.id:
	 *   the event ID
	 * this.event.target, this.event.source, this.event.effect:
	 *   the target, source, and effect of the event. These are the same
	 *   variables that are passed as arguments to the event handler, but
	 *   they're useful for functions called by the event handler.
	 */
	runEvent(
		eventid: string, target?: Pokemon | Pokemon[] | Side | Battle | null, source?: string | Pokemon | false | null,
		effect?: Effect | null, relayVar?: any, onEffect?: boolean, fastExit?: boolean) {
		// if (Battle.eventCounter) {
		// 	if (!Battle.eventCounter[eventid]) Battle.eventCounter[eventid] = 0;
		// 	Battle.eventCounter[eventid]++;
		// }
		if (this.eventDepth >= 8) {
			// oh fuck
			this.add('message', 'STACK LIMIT EXCEEDED');
			this.add('message', 'PLEASE REPORT IN BUG THREAD');
			this.add('message', 'Event: ' + eventid);
			this.add('message', 'Parent event: ' + this.event.id);
			throw new Error("Stack overflow");
		}
		if (!target) target = this;
		let effectSource = null;
		if (source instanceof Pokemon) effectSource = source;
		const handlers = this.findEventHandlers(target, eventid, effectSource);
		if (eventid === 'TryImmunity' || eventid === 'TryHit' || eventid === 'AfterDamage') {
			handlers.sort(Battle.compareLeftToRightOrder);
		} else if (fastExit) {
			handlers.sort(Battle.compareRedirectOrder);
		} else {
			this.speedSort(handlers);
		}
		let hasRelayVar = 1;
		const args = [target, source, effect];
		// console.log('Event: ' + eventid + ' (depth ' + this.eventDepth + ') t:' + target.id + ' s:' + (!source || source.id) + ' e:' + effect.id);
		if (relayVar === undefined || relayVar === null) {
			relayVar = true;
			hasRelayVar = 0;
		} else {
			args.unshift(relayVar);
		}

		const parentEvent = this.event;
		this.event = {id: eventid, target, source, effect, modifier: 1};
		this.eventDepth++;

		if (onEffect) {
			if (!effect) throw new Error("onEffect passed without an effect");
			// @ts-ignore - dynamic lookup
			const callback = effect[`on${eventid}`];
			if (callback !== undefined) {
				handlers.unshift({status: effect, callback, statusData: {}, end: null, thing: target});
			}
		}

		let targetRelayVars = [];
		if (Array.isArray(target)) {
			if (Array.isArray(relayVar)) {
				targetRelayVars = relayVar;
			} else {
				for (let i = 0; i < target.length; i++) targetRelayVars[i] = true;
			}
		}
		for (const handler of handlers) {
			if (handler.index !== undefined) {
				// TODO: find a better way to do this
				if (!targetRelayVars[handler.index] && !(targetRelayVars[handler.index] === 0 &&
					eventid === 'AfterDamage')) continue;
				if (handler.target) {
					args[hasRelayVar] = handler.target;
					this.event.target = handler.target;
				}
				if (hasRelayVar) args[0] = targetRelayVars[handler.index];
			}
			const status = handler.status;
			const thing = handler.thing;
			// this.debug('match ' + eventid + ': ' + status.id + ' ' + status.effectType);
			if (status.effectType === 'Status' && thing.status !== status.id) {
				// it's changed; call it off
				continue;
			}
			if (status.effectType === 'Ability' && !status.isUnbreakable &&
					this.suppressingAttackEvents() && this.activePokemon !== thing) {
				// ignore attacking events
				const AttackingEvents = {
					BeforeMove: 1,
					BasePower: 1,
					Immunity: 1,
					RedirectTarget: 1,
					Heal: 1,
					SetStatus: 1,
					CriticalHit: 1,
					ModifyAtk: 1, ModifyDef: 1, ModifySpA: 1, ModifySpD: 1, ModifySpe: 1, ModifyAccuracy: 1,
					ModifyBoost: 1,
					ModifyDamage: 1,
					ModifySecondaries: 1,
					ModifyWeight: 1,
					TryAddVolatile: 1,
					TryHit: 1,
					TryHitSide: 1,
					TryMove: 1,
					Boost: 1,
					DragOut: 1,
					Effectiveness: 1,
				};
				if (eventid in AttackingEvents) {
					this.debug(eventid + ' handler suppressed by Mold Breaker');
					continue;
				} else if (eventid === 'Damage' && effect && effect.effectType === 'Move') {
					this.debug(eventid + ' handler suppressed by Mold Breaker');
					continue;
				}
			}
			if (eventid !== 'Start' && eventid !== 'SwitchIn' && eventid !== 'TakeItem' &&
				status.effectType === 'Item' && (thing instanceof Pokemon) && thing.ignoringItem()) {
				if (eventid !== 'Update') {
					this.debug(eventid + ' handler suppressed by Embargo, Klutz or Magic Room');
				}
				continue;
			} else if (eventid !== 'End' && status.effectType === 'Ability' &&
					(thing instanceof Pokemon) && thing.ignoringAbility()) {
				if (eventid !== 'Update') {
					this.debug(eventid + ' handler suppressed by Gastro Acid');
				}
				continue;
			}
			if ((status.effectType === 'Weather' || eventid === 'Weather') &&
				eventid !== 'Residual' && eventid !== 'End' && this.field.suppressingWeather()) {
				this.debug(eventid + ' handler suppressed by Air Lock');
				continue;
			}
			let returnVal;
			if (typeof handler.callback === 'function') {
				const parentEffect = this.effect;
				const parentEffectData = this.effectData;
				this.effect = handler.status;
				this.effectData = handler.statusData || {};
				this.effectData.target = thing;

				returnVal = handler.callback.apply(this, args);

				this.effect = parentEffect;
				this.effectData = parentEffectData;
			} else {
				returnVal = handler.callback;
			}

			if (returnVal !== undefined) {
				relayVar = returnVal;
				if (!relayVar || fastExit) {
					if (handler.index !== undefined) {
						targetRelayVars[handler.index] = relayVar;
						if (targetRelayVars.every(val => !val)) break;
					} else {
						break;
					}
				}
				if (hasRelayVar) {
					args[0] = relayVar;
				}
			}
		}

		this.eventDepth--;
		if (typeof relayVar === 'number' && relayVar === Math.abs(Math.floor(relayVar))) {
			// this.debug(eventid + ' modifier: 0x' +
			// 	('0000' + (this.event.modifier * 4096).toString(16)).slice(-4).toUpperCase());
			relayVar = this.modify(relayVar, this.event.modifier);
		}
		this.event = parentEvent;

		return Array.isArray(target) ? targetRelayVars : relayVar;
	}

	/**
	 * priorityEvent works just like runEvent, except it exits and returns
	 * on the first non-undefined value instead of only on null/false.
	 */
	priorityEvent(
		eventid: string, target: Pokemon | Side | Battle, source?: Pokemon | null,
		effect?: Effect, relayVar?: any, onEffect?: boolean): any {
		return this.runEvent(eventid, target, source, effect, relayVar, onEffect, true);
	}

	resolveLastPriority(handlers: AnyObject[], callbackName: string) {
		const handler = handlers[handlers.length - 1];
		handler.order = handler.status[`${callbackName}Order`] || false;
		handler.priority = handler.status[`${callbackName}Priority`] || 0;
		handler.subOrder = handler.status[`${callbackName}SubOrder`] || 0;
		if (handler.thing && handler.thing.getStat) handler.speed = handler.thing.speed;
	}

	findEventHandlers(thing: Pokemon | Pokemon[] | Side | Battle, eventName: string, sourceThing?: Pokemon | null) {
		let handlers: AnyObject[] = [];
		if (Array.isArray(thing)) {
			for (const [i, pokemon] of thing.entries()) {
				// console.log(`Event: ${eventName}, Target: ${'' + pokemon}, ${i}`);
				const curHandlers = this.findEventHandlers(pokemon, eventName, sourceThing);
				for (const handler of curHandlers) {
					handler.target = pokemon; // Original "thing"
					handler.index = i;
				}
				handlers = handlers.concat(curHandlers);
			}
			return handlers;
		}
		if (thing instanceof Pokemon && thing.isActive) {
			handlers = this.findPokemonEventHandlers(thing, `on${eventName}`);
			for (const allyActive of thing.allies()) {
				handlers.push(...this.findPokemonEventHandlers(allyActive, `onAlly${eventName}`));
				handlers.push(...this.findPokemonEventHandlers(allyActive, `onAny${eventName}`));
			}
			for (const foeActive of thing.foes()) {
				handlers.push(...this.findPokemonEventHandlers(foeActive, `onFoe${eventName}`));
				handlers.push(...this.findPokemonEventHandlers(foeActive, `onAny${eventName}`));
			}
			thing = thing.side;
		}
		if (sourceThing) {
			handlers.push(...this.findPokemonEventHandlers(sourceThing, `onSource${eventName}`));
		}
		if (thing instanceof Side) {
			const team = this.gameType === 'multi' ? thing.n % 2 : null;
			for (const side of this.sides) {
				if (team === null ? side === thing : side.n % 2 === team) {
					handlers.push(...this.findSideEventHandlers(side, `on${eventName}`));
				} else {
					handlers.push(...this.findSideEventHandlers(side, `onFoe${eventName}`));
				}
				handlers.push(...this.findSideEventHandlers(side, `onAny${eventName}`));
			}
		}
		handlers.push(...this.findFieldEventHandlers(this.field, `on${eventName}`));
		handlers.push(...this.findBattleEventHandlers(`on${eventName}`));
		return handlers;
	}

	findPokemonEventHandlers(pokemon: Pokemon, callbackName: string, getKey?: 'duration') {
		const handlers: AnyObject[] = [];

		const status = pokemon.getStatus();
		// @ts-ignore - dynamic lookup
		let callback = status[callbackName];
		if (callback !== undefined || (getKey && pokemon.statusData[getKey])) {
			handlers.push({
				status, callback, statusData: pokemon.statusData, end: pokemon.clearStatus, thing: pokemon,
			});
			this.resolveLastPriority(handlers, callbackName);
		}
		for (const i in pokemon.volatiles) {
			const volatileData = pokemon.volatiles[i];
			const volatile = pokemon.getVolatile(i);
			// @ts-ignore - dynamic lookup
			callback = volatile[callbackName];
			if (callback !== undefined || (getKey && volatileData[getKey])) {
				handlers.push({
					status: volatile, callback, statusData: volatileData, end: pokemon.removeVolatile, thing: pokemon,
				});
				this.resolveLastPriority(handlers, callbackName);
			}
		}
		const ability = pokemon.getAbility();
		// @ts-ignore - dynamic lookup
		callback = ability[callbackName];
		if (callback !== undefined || (getKey && pokemon.abilityData[getKey])) {
			handlers.push({
				status: ability, callback, statusData: pokemon.abilityData, end: pokemon.clearAbility, thing: pokemon,
			});
			this.resolveLastPriority(handlers, callbackName);
		}
		const item = pokemon.getItem();
		// @ts-ignore - dynamic lookup
		callback = item[callbackName];
		if (callback !== undefined || (getKey && pokemon.itemData[getKey])) {
			handlers.push({
				status: item, callback, statusData: pokemon.itemData, end: pokemon.clearItem, thing: pokemon,
			});
			this.resolveLastPriority(handlers, callbackName);
		}
		const species = pokemon.baseTemplate;
		// @ts-ignore - dynamic lookup
		callback = species[callbackName];
		if (callback !== undefined) {
			handlers.push({
				status: species, callback, statusData: pokemon.speciesData, end() {}, thing: pokemon,
			});
			this.resolveLastPriority(handlers, callbackName);
		}
		const side = pokemon.side;
		for (const conditionid in side.slotConditions[pokemon.position]) {
			const slotConditionData = side.slotConditions[pokemon.position][conditionid];
			const slotCondition = side.getSlotCondition(pokemon, conditionid);
			// @ts-ignore - dynamic lookup
			callback = slotCondition[callbackName];
			if (callback !== undefined || (getKey && slotConditionData[getKey])) {
				handlers.push({
					status: slotCondition,
					callback,
					statusData: slotConditionData,
					end: side.removeSlotCondition,
					endCallArgs: [side, pokemon, slotCondition!.id],
					thing: side,
				});
				this.resolveLastPriority(handlers, callbackName);
			}
		}

		return handlers;
	}

	findBattleEventHandlers(callbackName: string, getKey?: 'duration') {
		const callbackNamePriority = `${callbackName}Priority`;
		const handlers: AnyObject[] = [];

		let callback;
		const format = this.getFormat();
		// @ts-ignore - dynamic lookup
		callback = format[callbackName];
		// @ts-ignore - dynamic lookup
		if (callback !== undefined || (getKey && this.formatData[getKey])) {
			handlers.push({
				status: format, callback, statusData: this.formatData, end() {}, thing: this,
				// @ts-ignore - dynamic lookup
				priority: format[callbackNamePriority] || 0});
			this.resolveLastPriority(handlers, callbackName);
		}
		// tslint:disable-next-line:no-conditional-assignment
		if (this.events && (callback = this.events[callbackName]) !== undefined) {
			for (const handler of callback) {
				const statusData = (handler.target.effectType === 'Format') ? this.formatData : undefined;
				handlers.push({
					status: handler.target, callback: handler.callback, statusData, end() {},
					thing: this, priority: handler.priority, order: handler.order, subOrder: handler.subOrder});
			}
		}
		return handlers;
	}

	findFieldEventHandlers(field: Field, callbackName: string, getKey?: 'duration') {
		const callbackNamePriority = `${callbackName}Priority`;
		const handlers: AnyObject[] = [];

		let callback;
		for (const i in field.pseudoWeather) {
			const pseudoWeatherData = field.pseudoWeather[i];
			const pseudoWeather = field.getPseudoWeather(i);
			// @ts-ignore - dynamic lookup
			callback = pseudoWeather[callbackName];
			if (callback !== undefined || (getKey && pseudoWeatherData[getKey])) {
				handlers.push({
					status: pseudoWeather, callback, statusData: pseudoWeatherData, end: field.removePseudoWeather, thing: field,
				});
				this.resolveLastPriority(handlers, callbackName);
			}
		}
		const weather = field.getWeather();
		// @ts-ignore - dynamic lookup
		callback = weather[callbackName];
		if (callback !== undefined || (getKey && this.field.weatherData[getKey])) {
			handlers.push({
				status: weather, callback, statusData: this.field.weatherData, end: field.clearWeather, thing: field,
				// @ts-ignore - dynamic lookup
				priority: weather[callbackNamePriority] || 0});
			this.resolveLastPriority(handlers, callbackName);
		}
		const terrain = field.getTerrain();
		// @ts-ignore - dynamic lookup
		callback = terrain[callbackName];
		if (callback !== undefined || (getKey && field.terrainData[getKey])) {
			handlers.push({
				status: terrain, callback, statusData: field.terrainData, end: field.clearTerrain, thing: field,
				// @ts-ignore - dynamic lookup
				priority: terrain[callbackNamePriority] || 0});
			this.resolveLastPriority(handlers, callbackName);
		}

		return handlers;
	}

	findSideEventHandlers(side: Side, callbackName: string, getKey?: 'duration') {
		const handlers: AnyObject[] = [];

		for (const i in side.sideConditions) {
			const sideConditionData = side.sideConditions[i];
			const sideCondition = side.getSideCondition(i);
			// @ts-ignore - dynamic lookup
			const callback = sideCondition[callbackName];
			if (callback !== undefined || (getKey && sideConditionData[getKey])) {
				handlers.push({
					status: sideCondition, callback, statusData: sideConditionData, end: side.removeSideCondition, thing: side,
				});
				this.resolveLastPriority(handlers, callbackName);
			}
		}
		return handlers;
	}

	/**
	 * Use this function to attach custom event handlers to a battle. See Battle#runEvent for
	 * more information on how to write callbacks for event handlers.
	 *
	 * Try to use this sparingly. Most event handlers can be simply placed in a format instead.
	 *
	 *     this.onEvent(eventid, target, callback)
	 * will set the callback as an event handler for the target when eventid is called with the
	 * default priority. Currently only valid formats are supported as targets but this will
	 * eventually be expanded to support other target types.
	 *
	 *     this.onEvent(eventid, target, priority, callback)
	 * will set the callback as an event handler for the target when eventid is called with the
	 * provided priority. Priority can either be a number or an object that contains the priority,
	 * order, and subOrder for the event handler as needed (undefined keys will use default values)
	 */
	onEvent(eventid: string, target: Format, ...rest: AnyObject[]) { // rest = [priority, callback]
		if (!eventid) throw new TypeError("Event handlers must have an event to listen to");
		if (!target) throw new TypeError("Event handlers must have a target");
		if (!rest.length) throw new TypeError("Event handlers must have a callback");

		if (target.effectType !== 'Format') {
			throw new TypeError(`${target.name} is a ${target.effectType} but only Format targets are supported right now`);
		}

		// tslint:disable-next-line:one-variable-per-declaration
		let callback, priority, order, subOrder, data;
		if (rest.length === 1) {
			[callback] = rest;
			priority = 0;
			order = false;
			subOrder = 0;
		} else {
			[data, callback] = rest;
			if (typeof data === 'object') {
				priority = data['priority'] || 0;
				order = data['order'] || false;
				subOrder = data['subOrder'] || 0;
			} else {
				priority = data || 0;
				order = false;
				subOrder = 0;
			}
		}

		const eventHandler = {callback, target, priority, order, subOrder};

		if (!this.events) this.events = {};
		const callbackName = `on${eventid}`;
		const eventHandlers = this.events[callbackName];
		if (eventHandlers === undefined) {
			this.events[callbackName] = [eventHandler];
		} else {
			eventHandlers.push(eventHandler);
		}
	}

	getPokemon(id: string | Pokemon) {
		if (typeof id !== 'string') id = id.id;
		for (const side of this.sides) {
			for (const pokemon of side.pokemon) {
				if (pokemon.id === id) return pokemon;
			}
		}
		return null;
	}

	getAllPokemon() {
		const pokemonList: Pokemon[] = [];
		for (const side of this.sides) {
			pokemonList.push(...side.pokemon);
		}
		return pokemonList;
	}

	getAllActive() {
		const pokemonList: Pokemon[] = [];
		for (const side of this.sides) {
			for (const pokemon of side.active) {
				if (pokemon && !pokemon.fainted) {
					pokemonList.push(pokemon);
				}
			}
		}
		return pokemonList;
	}

	makeRequest(type?: RequestState) {
		if (type) {
			this.requestState = type;
			for (const side of this.sides) {
				side.clearChoice();
			}
		} else {
			type = this.requestState;
		}

		// default to no request
		const requests: any[] = Array(this.sides.length).fill(null);
		for (const side of this.sides) {
			side.activeRequest = null;
		}

		switch (type) {
		case 'switch': {
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				const switchTable = [];
				for (const pokemon of side.active) {
					switchTable.push(!!(pokemon && pokemon.switchFlag));
				}
				if (switchTable.some(flag => flag === true)) {
					requests[i] = {forceSwitch: switchTable, side: side.getRequestData()};
				}
			}
			break;
		}

		case 'teampreview':
			const teamLengthData = this.getFormat().teamLength;
			let maxTeamSize = teamLengthData && teamLengthData.battle;
			this.add('teampreview' + (maxTeamSize ? '|' + maxTeamSize : ''));
			if (!maxTeamSize) maxTeamSize = 6;
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				side.maxTeamSize = maxTeamSize;
				requests[i] = {teamPreview: true, maxTeamSize, side: side.getRequestData()};
			}
			break;

		default: {
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				const activeData = side.active.map(pokemon => pokemon && pokemon.getRequestData());
				requests[i] = {active: activeData, side: side.getRequestData()};
			}
			break;
		}
		}

		const allRequestsMade = requests.every(request => request);
		for (let i = 0; i < this.sides.length; i++) {
			const side = this.sides[i];
			const request = requests[i];
			if (request) {
				if (!this.supportCancel || !allRequestsMade) request.noCancel = true;
				side.emitRequest(request);
			} else {
				side.emitRequest({wait: true, side: side.getRequestData()});
			}
		}

		if (this.sides.every(side => side.isChoiceDone())) {
			throw new Error(`Choices are done immediately after a request`);
		}
	}

	tiebreak() {
		if (this.ended) return false;

		this.inputLog.push(`>tiebreak`);
		this.add('message', "Time's up! Going to tiebreaker...");
		const notFainted = this.sides.map(side => (
			side.pokemon.filter(pokemon => !pokemon.fainted).length
		));
		this.add('-message', this.sides.map((side, i) => (
			`${side.name}: ${notFainted[i]} Pokemon left`
		)).join('; '));
		const maxNotFainted = Math.max(...notFainted);
		let tiedSides = this.sides.filter((side, i) => notFainted[i] === maxNotFainted);
		if (tiedSides.length <= 1) {
			return this.win(tiedSides[0]);
		}

		const hpPercentage = tiedSides.map(side => (
			side.pokemon.map(pokemon => pokemon.hp / pokemon.maxhp).reduce((a, b) => a + b) * 100 / 6
		));
		this.add('-message', tiedSides.map((side, i) => (
			`${side.name}: ${Math.round(hpPercentage[i])}% total HP left`
		)).join('; '));
		const maxPercentage = Math.max(...hpPercentage);
		tiedSides = tiedSides.filter((side, i) => hpPercentage[i] === maxPercentage);
		if (tiedSides.length <= 1) {
			return this.win(tiedSides[0]);
		}

		const hpTotal = tiedSides.map(side => (
			side.pokemon.map(pokemon => pokemon.hp).reduce((a, b) => a + b)
		));
		this.add('-message', tiedSides.map((side, i) => (
			`${side.name}: ${Math.round(hpTotal[i])} total HP left`
		)).join('; '));
		const maxTotal = Math.max(...hpTotal);
		tiedSides = tiedSides.filter((side, i) => hpTotal[i] === maxTotal);
		if (tiedSides.length <= 1) {
			return this.win(tiedSides[0]);
		}
		return this.tie();
	}

	forceWin(side: SideID | null = null) {
		if (this.ended) return false;
		this.inputLog.push(side ? `>forcewin ${side}` : `>forcetie`);
		return this.win(side);
	}

	tie() {
		return this.win();
	}

	win(side?: SideID | '' | Side | null) {
		if (this.ended) return false;
		if (side && typeof side === 'string') {
			side = this.getSide(side);
		} else if (!side || !this.sides.includes(side)) {
			side = null;
		}
		this.winner = side ? side.name : '';

		this.add('');
		if (side) {
			this.add('win', side.name);
		} else {
			this.add('tie');
		}
		this.ended = true;
		this.requestState = '';
		for (const s of this.sides) {
			s.activeRequest = null;
		}
		return true;
	}

	switchIn(pokemon: Pokemon, pos?: number, sourceEffect: Effect | null = null) {
		if (!pokemon || pokemon.isActive) return false;
		if (!pos) pos = 0;
		const side = pokemon.side;
		if (pos >= side.active.length) {
			throw new Error("Invalid switch position");
		}
		let newMove = null;
		if (side.active[pos]) {
			const oldActive = side.active[pos];
			if (this.gen === 4 && sourceEffect) {
				newMove = oldActive.lastMove;
			}
			if (this.cancelMove(oldActive)) {
				for (const foeActive of side.foe.active) {
					if (foeActive.isStale >= 2) {
						oldActive.isStaleCon++;
						oldActive.isStaleSource = 'drag';
						break;
					}
				}
			}
			if (oldActive.switchCopyFlag) {
				oldActive.switchCopyFlag = false;
				pokemon.copyVolatileFrom(oldActive);
			}
		}
		if (newMove) pokemon.lastMove = newMove;
		pokemon.isActive = true;
		this.runEvent('BeforeSwitchIn', pokemon);
		if (side.active[pos]) {
			const oldActive = side.active[pos];
			oldActive.isActive = false;
			oldActive.isStarted = false;
			oldActive.usedItemThisTurn = false;
			oldActive.position = pokemon.position;
			pokemon.position = pos;
			side.pokemon[pokemon.position] = pokemon;
			side.pokemon[oldActive.position] = oldActive;
			this.cancelMove(oldActive);
			oldActive.clearVolatile();
		}
		side.active[pos] = pokemon;
		pokemon.activeTurns = 0;
		for (const moveSlot of pokemon.moveSlots) {
			moveSlot.used = false;
		}
		this.add('switch', pokemon, pokemon.getDetails);
		if (sourceEffect) this.log[this.log.length - 1] += `|[from]${sourceEffect.fullname}`;
		this.insertQueue({pokemon, choice: 'runUnnerve'});
		this.insertQueue({pokemon, choice: 'runSwitch'});
	}

	canSwitch(side: Side) {
		return this.possibleSwitches(side).length;
	}

	getRandomSwitchable(side: Side) {
		const canSwitchIn = this.possibleSwitches(side);
		return canSwitchIn.length ? this.sample(canSwitchIn) : null;
	}

	private possibleSwitches(side: Side) {
		const canSwitchIn = [];
		for (let i = side.active.length; i < side.pokemon.length; i++) {
			const pokemon = side.pokemon[i];
			if (!pokemon.fainted) {
				canSwitchIn.push(pokemon);
			}
		}
		return canSwitchIn;
	}

	dragIn(side: Side, pos?: number) {
		if (!pos) pos = 0;
		if (pos >= side.active.length) return false;
		const pokemon = this.getRandomSwitchable(side);
		if (!pokemon || pokemon.isActive) return false;
		pokemon.isActive = true;
		this.runEvent('BeforeSwitchIn', pokemon);
		if (side.active[pos]) {
			const oldActive = side.active[pos];
			if (!oldActive.hp) {
				return false;
			}
			if (!this.runEvent('DragOut', oldActive)) {
				return false;
			}
			this.runEvent('SwitchOut', oldActive);
			oldActive.illusion = null;
			this.singleEvent('End', this.getAbility(oldActive.ability), oldActive.abilityData, oldActive);
			oldActive.isActive = false;
			oldActive.isStarted = false;
			oldActive.usedItemThisTurn = false;
			oldActive.position = pokemon.position;
			pokemon.position = pos;
			side.pokemon[pokemon.position] = pokemon;
			side.pokemon[oldActive.position] = oldActive;
			if (this.cancelMove(oldActive)) {
				for (const foeActive of side.foe.active) {
					if (foeActive.isStale >= 2) {
						oldActive.isStaleCon++;
						oldActive.isStaleSource = 'drag';
						break;
					}
				}
			}
			oldActive.clearVolatile();
		}
		side.active[pos] = pokemon;
		pokemon.activeTurns = 0;
		if (this.gen === 2) pokemon.draggedIn = this.turn;
		for (const moveSlot of pokemon.moveSlots) {
			moveSlot.used = false;
		}
		this.add('drag', pokemon, pokemon.getDetails);
		if (this.gen >= 5) {
			this.singleEvent('PreStart', pokemon.getAbility(), pokemon.abilityData, pokemon);
			this.runEvent('SwitchIn', pokemon);
			if (!pokemon.hp) return true;
			pokemon.isStarted = true;
			if (!pokemon.fainted) {
				this.singleEvent('Start', pokemon.getAbility(), pokemon.abilityData, pokemon);
				this.singleEvent('Start', pokemon.getItem(), pokemon.itemData, pokemon);
			}
		} else {
			this.insertQueue({pokemon, choice: 'runSwitch'});
		}
		return true;
	}

	swapPosition(pokemon: Pokemon, slot: number, attributes?: string | AnyObject) {
		if (slot >= pokemon.side.active.length) {
			throw new Error("Invalid swap position");
		}
		const target = pokemon.side.active[slot];
		if (slot !== 1 && (!target || target.fainted)) return false;

		this.add('swap', pokemon, slot, attributes || '');

		const side = pokemon.side;
		side.pokemon[pokemon.position] = target;
		side.pokemon[slot] = pokemon;
		side.active[pokemon.position] = side.pokemon[pokemon.position];
		side.active[slot] = side.pokemon[slot];
		if (target) target.position = pokemon.position;
		pokemon.position = slot;
		return true;
	}

	faint(pokemon: Pokemon, source?: Pokemon, effect?: Effect) {
		pokemon.faint(source, effect);
	}

	nextTurn() {
		this.turn++;
		let allStale = true;
		let oneStale: Pokemon | null = null;
		for (const side of this.sides) {
			for (const pokemon of side.active) {
				if (!pokemon) continue;
				pokemon.moveThisTurn = '';
				pokemon.usedItemThisTurn = false;
				pokemon.newlySwitched = false;
				pokemon.moveLastTurnResult = pokemon.moveThisTurnResult;
				pokemon.moveThisTurnResult = undefined;
				pokemon.hurtThisTurn = false;

				pokemon.maybeDisabled = false;
				for (const moveSlot of pokemon.moveSlots) {
					moveSlot.disabled = false;
					moveSlot.disabledSource = '';
				}
				this.runEvent('DisableMove', pokemon);
				if (!pokemon.ateBerry) pokemon.disableMove('belch');

				// If it was an illusion, it's not any more
				if (pokemon.getLastAttackedBy() && this.gen >= 7) pokemon.knownType = true;

				for (let i = pokemon.attackedBy.length - 1; i >= 0; i--) {
					const attack = pokemon.attackedBy[i];
					if (attack.source.isActive) {
						attack.thisTurn = false;
					} else {
						pokemon.attackedBy.splice(pokemon.attackedBy.indexOf(attack), 1);
					}
				}

				if (this.gen >= 7) {
					// In Gen 7, the real type of every Pokemon is visible to all players via the bottom screen while making choices
					const seenPokemon = pokemon.illusion || pokemon;
					const realTypeString = seenPokemon.getTypes(true).join('/');
					if (realTypeString !== seenPokemon.apparentType) {
						this.add('-start', pokemon, 'typechange', realTypeString, '[silent]');
						seenPokemon.apparentType = realTypeString;
						if (pokemon.addedType) {
							// The typechange message removes the added type, so put it back
							this.add('-start', pokemon, 'typeadd', pokemon.addedType, '[silent]');
						}
					}
				}

				pokemon.trapped = pokemon.maybeTrapped = false;
				this.runEvent('TrapPokemon', pokemon);
				if (!pokemon.knownType || this.getImmunity('trapped', pokemon)) {
					this.runEvent('MaybeTrapPokemon', pokemon);
				}
				// canceling switches would leak information
				// if a foe might have a trapping ability
				if (this.gen > 2) {
					for (const source of pokemon.side.foe.active) {
						if (!source || source.fainted) continue;
						const template = (source.illusion || source).template;
						if (!template.abilities) continue;
						for (const abilitySlot in template.abilities) {
							const abilityName = template.abilities[abilitySlot as keyof TemplateAbility];
							if (abilityName === source.ability) {
								// pokemon event was already run above so we don't need
								// to run it again.
								continue;
							}
							const ruleTable = this.getRuleTable(this.getFormat());
							if (!ruleTable.has('-illegal') && !this.getFormat().team) {
								// hackmons format
								continue;
							} else if (abilitySlot === 'H' && template.unreleasedHidden) {
								// unreleased hidden ability
								continue;
							}
							const ability = this.getAbility(abilityName);
							if (ruleTable.has('-ability:' + ability.id)) continue;
							if (pokemon.knownType && !this.getImmunity('trapped', pokemon)) continue;
							this.singleEvent('FoeMaybeTrapPokemon', ability, {}, pokemon, source);
						}
					}
				}

				if (pokemon.fainted) continue;
				[allStale, oneStale] = this.updateStaleness(pokemon);
			}
			side.faintedLastTurn = side.faintedThisTurn;
			side.faintedThisTurn = false;
		}

		if (this.maybeIssueStalenessWarning(allStale, oneStale)) return;

		if (this.gameType === 'triples' && !this.sides.filter(side => side.pokemonLeft > 1).length) {
			// If both sides have one Pokemon left in triples and they are not adjacent, they are both moved to the center.
			const actives = this.getAllActive();
			if (actives.length > 1 && !this.isAdjacent(actives[0], actives[1])) {
				this.swapPosition(actives[0], 1, '[silent]');
				this.swapPosition(actives[1], 1, '[silent]');
				this.add('-center');
			}
		}

		this.add('turn', this.turn);

		this.makeRequest('move');
	}

	private updateStaleness(pokemon: Pokemon): [boolean, Pokemon | null] {
		let allStale = true;
		let oneStale: Pokemon | null = null;
		if (pokemon.isStale < 2) {
			if (pokemon.isStaleCon >= 2) {
				if (pokemon.hp >= pokemon.isStaleHP - pokemon.maxhp / 100) {
					pokemon.isStale++;
					if (this.firstStaleWarned && pokemon.isStale < 2) {
						switch (pokemon.isStaleSource) {
							case 'struggle':
								this.add('bigerror', `${pokemon.name} isn't losing HP from Struggle. If this continues, it will be classified as being in an endless loop`);
								break;
							case 'drag':
								this.add('bigerror', `${pokemon.name} isn't losing PP or HP from being forced to switch. If this continues, it will be classified as being in an endless loop`);
								break;
							case 'switch':
								this.add('bigerror', `${pokemon.name} isn't losing PP or HP from repeatedly switching. If this continues, it will be classified as being in an endless loop`);
								break;
						}
					}
				}
				pokemon.isStaleCon = 0;
				pokemon.isStalePPTurns = 0;
				pokemon.isStaleHP = pokemon.hp;
			}
			if (pokemon.isStalePPTurns >= 5) {
				if (pokemon.hp >= pokemon.isStaleHP - pokemon.maxhp / 100) {
					pokemon.isStale++;
					pokemon.isStaleSource = 'ppstall';
					if (this.firstStaleWarned && pokemon.isStale < 2) {
						this.add('bigerror', `${pokemon.name} isn't losing PP or HP. If it keeps on not losing PP or HP, it will be classified as being in an endless loop.`);
					}
				}
				pokemon.isStaleCon = 0;
				pokemon.isStalePPTurns = 0;
				pokemon.isStaleHP = pokemon.hp;
			}
		}
		if (pokemon.getMoves().length === 0) {
			pokemon.isStaleCon++;
			pokemon.isStaleSource = 'struggle';
		}
		if (pokemon.isStale < 2) {
			allStale = false;
		} else if (pokemon.isStale && !pokemon.staleWarned) {
			oneStale = pokemon;
		}
		if (!pokemon.isStalePPTurns) {
			pokemon.isStaleHP = pokemon.hp;
			if (pokemon.activeTurns) pokemon.isStaleCon = 0;
		}
		if (pokemon.activeTurns) {
			pokemon.isStalePPTurns++;
		}
		pokemon.activeTurns++;
		return [allStale, oneStale];
	}

	private maybeIssueStalenessWarning(allStale: boolean, oneStale: Pokemon | null) {
		const ruleTable = this.getRuleTable(this.getFormat());
		if (ruleTable.has('endlessbattleclause')) {
			if (oneStale) {
				let activationWarning = ` - If all active Pok\u00e9mon go in an endless loop, Endless Battle Clause will activate.`;
				if (allStale) activationWarning = ``;
				// @ts-ignore - index signature
				const loopReason = (oneStale.isStaleSource && {
					struggle: `: it isn't losing HP from Struggle`,
					drag: `: it isn't losing PP or HP from being forced to switch`,
					switch: `: it isn't losing PP or HP from repeatedly switching`,
					getleppa: `: it got a Leppa Berry it didn't start with`,
					useleppa: `: it used a Leppa Berry it didn't start with`,
					ppstall: `: it isn't losing PP or HP`,
					ppoverflow: `: its PP overflowed`,
				}[oneStale.isStaleSource]) || ``;
				this.add('bigerror', `${oneStale.name} is in an endless loop${loopReason}.${activationWarning}`);
				oneStale.staleWarned = true;
				this.firstStaleWarned = true;
			}
			if (allStale) {
				this.add('message', `All active Pok\u00e9mon are in an endless loop. Endless Battle Clause activated!`);
				let leppaPokemon = null;
				for (const side of this.sides) {
					for (const pokemon of side.pokemon) {
						if (toId(pokemon.set.item) === 'leppaberry') {
							if (leppaPokemon) {
								leppaPokemon = null; // both sides have Leppa
								this.add('-message', `Both sides started with a Leppa Berry.`);
							} else {
								leppaPokemon = pokemon;
							}
							break;
						}
					}
				}
				if (leppaPokemon) {
					this.add('-message', `${leppaPokemon.side.name}'s ${leppaPokemon.name} started with a Leppa Berry and loses.`);
					this.win(leppaPokemon.side.foe);
					return true;
				}
				this.win();
				return true;
			}
			if ((this.turn >= 500 && this.turn % 100 === 0) ||
				(this.turn >= 900 && this.turn % 10 === 0) ||
				(this.turn >= 990)) {
				const turnsLeft = 1000 - this.turn;
				if (turnsLeft < 0) {
					this.add('message', `It is turn 1000. Endless Battle Clause activated!`);
					this.tie();
					return true;
				}
				const turnsLeftText = (turnsLeft === 1 ? `1 turn` : `${turnsLeft} turns`);
				this.add('bigerror', `You will auto-tie if the battle doesn't end in ${turnsLeftText} (on turn 1000).`);
			}
		} else {
			if (allStale && !this.staleWarned) {
				this.staleWarned = true;
				this.add('bigerror', `If this format had Endless Battle Clause, it would have activated.`);
			} else if (oneStale) {
				this.add('bigerror', `${oneStale.name} is in an endless loop.`);
				oneStale.staleWarned = true;
			}
		}
		return false;
	}

	start() {
		// need all players to start
		if (!this.sides.every(side => !!side)) return;

		if (this.started) return;

		this.started = true;
		this.sides[1].foe = this.sides[0];
		this.sides[0].foe = this.sides[1];

		for (const side of this.sides) {
			this.add('teamsize', side.id, side.pokemon.length);
		}

		this.add('gametype', this.gameType);
		this.add('gen', this.gen);

		const format = this.getFormat();

		this.add('tier', format.name);
		if (this.rated) {
			if (this.rated === 'Rated battle') this.rated = true;
			this.add('rated', typeof this.rated === 'string' ? this.rated : '');
		}

		if (format.onBegin) {
			format.onBegin.call(this);
		}
		for (const rule of this.getRuleTable(format).keys()) {
			if (rule.startsWith('+') || rule.startsWith('-') || rule.startsWith('!')) continue;
			const subFormat = this.getFormat(rule);
			if (subFormat.exists) {
				if (subFormat.onBegin) subFormat.onBegin.call(this);
			}
		}

		if (this.sides.some(side => !side.pokemon[0])) {
			throw new Error('Battle not started: A player has an empty team.');
		}

		this.residualEvent('TeamPreview');

		this.addToQueue({choice: 'start'});
		this.midTurn = true;
		if (!this.requestState) this.go();
	}

	boost(
		boost: SparseBoostsTable, target: Pokemon | null = null, source: Pokemon | null = null,
		effect: Effect | null = null, isSecondary: boolean = false, isSelf: boolean = false) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (!target || !target.hp) return 0;
		if (!target.isActive) return false;
		if (this.gen > 5 && !target.side.foe.pokemonLeft) return false;
		boost = this.runEvent('Boost', target, source, effect, Object.assign({}, boost));
		let success = null;
		let boosted = false;
		let boostName: BoostName;
		for (boostName in boost) {
			const currentBoost: SparseBoostsTable = {};
			currentBoost[boostName] = boost[boostName];
			let boostBy = target.boostBy(currentBoost);
			let msg = '-boost';
			if (boost[boostName]! < 0) {
				msg = '-unboost';
				boostBy = -boostBy;
			}
			if (boostBy) {
				success = true;
				switch (effect && effect.id) {
				case 'bellydrum':
					this.add('-setboost', target, 'atk', target.boosts['atk'], '[from] move: Belly Drum');
					break;
				case 'bellydrum2':
					this.add(msg, target, boostName, boostBy, '[silent]');
					this.hint("In Gen 2, Belly Drum boosts by 2 when it fails.");
					break;
				case 'intimidate': case 'gooey': case 'tanglinghair':
					this.add(msg, target, boostName, boostBy);
					break;
				case 'zpower':
					this.add(msg, target, boostName, boostBy, '[zeffect]');
					break;
				default:
					if (!effect) break;
					if (effect.effectType === 'Move') {
						this.add(msg, target, boostName, boostBy);
					} else {
						if (effect.effectType === 'Ability' && !boosted) {
							this.add('-ability', target, effect.name, 'boost');
							boosted = true;
						}
						this.add(msg, target, boostName, boostBy);
					}
					break;
				}
				this.runEvent('AfterEachBoost', target, source, effect, currentBoost);
			} else if (effect && effect.effectType === 'Ability') {
				if (isSecondary) this.add(msg, target, boostName, boostBy);
			} else if (!isSecondary && !isSelf) {
				this.add(msg, target, boostName, boostBy);
			}
		}
		this.runEvent('AfterBoost', target, source, effect, boost);
		return success;
	}

	spreadDamage(
		damage: SpreadMoveDamage, targetArray: (false | Pokemon | null)[] | null = null,
		source: Pokemon | null = null, effect: 'drain' | 'recoil' | Effect | null = null, instafaint: boolean = false
	) {
		if (!targetArray) return [0];
		let retVals: (number | false | undefined)[] = [];
		if (typeof effect === 'string' || !effect) effect = this.getEffect(effect);
		for (const [i, curDamage] of damage.entries()) {
			const target = targetArray[i];
			let targetDamage = curDamage;
			if (!(targetDamage || targetDamage === 0)) {
				retVals[i] = targetDamage;
				continue;
			}
			if (!target || !target.hp) {
				retVals[i] = 0;
				continue;
			}
			if (!target.isActive) {
				retVals[i] = false;
				continue;
			}
			if (targetDamage !== 0) targetDamage = this.clampIntRange(targetDamage, 1);

			if (effect.id !== 'struggle-recoil') { // Struggle recoil is not affected by effects
				if (effect.effectType === 'Weather' && !target.runStatusImmunity(effect.id)) {
					this.debug('weather immunity');
					retVals[i] = 0;
					continue;
				}
				targetDamage = this.runEvent('Damage', target, source, effect, targetDamage);
				if (!(targetDamage || targetDamage === 0)) {
					this.debug('damage event failed');
					retVals[i] = curDamage === true ? undefined : targetDamage;
					continue;
				}
			}
			if (targetDamage !== 0) targetDamage = this.clampIntRange(targetDamage, 1);

			if (this.gen <= 1) {
				if (this.currentMod === 'stadium' ||
					!['recoil', 'drain'].includes(effect.id) && effect.effectType !== 'Status') {
					this.lastDamage = targetDamage;
				}
			}

			retVals[i] = targetDamage = target.damage(targetDamage, source, effect);
			if (targetDamage !== 0) target.hurtThisTurn = true;
			if (source && effect.effectType === 'Move') source.lastDamage = targetDamage;

			const name = effect.fullname === 'tox' ? 'psn' : effect.fullname;
			switch (effect.id) {
			case 'partiallytrapped':
				this.add('-damage', target, target.getHealth, '[from] ' + this.effectData.sourceEffect.fullname, '[partiallytrapped]');
				break;
			case 'powder':
				this.add('-damage', target, target.getHealth, '[silent]');
				break;
			case 'confused':
				this.add('-damage', target, target.getHealth, '[from] confusion');
				break;
			default:
				if (effect.effectType === 'Move' || !name) {
					this.add('-damage', target, target.getHealth);
				} else if (source && (source !== target || effect.effectType === 'Ability')) {
					this.add('-damage', target, target.getHealth, '[from] ' + name, '[of] ' + source);
				} else {
					this.add('-damage', target, target.getHealth, '[from] ' + name);
				}
				break;
			}

			if (targetDamage) {
				if (this.gen <= 1 && effect.recoil && source) {
					const amount = this.clampIntRange(Math.floor(targetDamage * effect.recoil[0] / effect.recoil[1]), 1);
					this.damage(amount, source, target, 'recoil');
				}
				if (this.gen <= 4 && effect.drain && source) {
					const amount = this.clampIntRange(Math.floor(targetDamage * effect.drain[0] / effect.drain[1]), 1);
					this.heal(amount, source, target, 'drain');
				}
				if (this.gen > 4 && effect.drain && source) {
					const amount = Math.round(targetDamage * effect.drain[0] / effect.drain[1]);
					this.heal(amount, source, target, 'drain');
				}
			}
		}

		// @ts-ignore - FIXME AfterDamage passes an Effect, not an ActiveMove
		if (!effect.flags) effect.flags = {};
		if (instafaint) {
			for (const [i, target] of targetArray.entries()) {
				if (!retVals[i] || !target) continue;

				if (target.hp <= 0) {
					this.debug('instafaint: ' + this.faintQueue.map(entry => entry.target.name));
					this.faintMessages(true);
					if (this.gen <= 2) {
						target.faint();
						if (this.gen <= 1) this.queue = [];
					}
				}
			}
		}
		retVals = this.runEvent('AfterDamage', (targetArray.filter(val => !!val)) as Pokemon[], source, effect, retVals);

		return retVals;
	}

	damage(
		damage: number, target: Pokemon | null = null, source: Pokemon | null = null,
		effect: 'drain' | 'recoil' | Effect | null = null, instafaint: boolean = false) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		return this.spreadDamage([damage], [target], source, effect, instafaint)[0];
	}

	directDamage(damage: number, target?: Pokemon, source: Pokemon | null = null, effect: Effect | null = null) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (!target || !target.hp) return 0;
		if (!damage) return 0;
		damage = this.clampIntRange(damage, 1);

		if (typeof effect === 'string' || !effect) effect = this.getEffect(effect);

		// In Gen 1 BUT NOT STADIUM, Substitute also takes confusion and HJK recoil damage
		if (this.gen <= 1 && this.currentMod !== 'stadium' &&
			['confusion', 'jumpkick', 'highjumpkick'].includes(effect.id) && target.volatiles['substitute']) {

			const hint = "In Gen 1, if a Pokemon with a Substitute hurts itself due to confusion or Jump Kick/Hi Jump Kick recoil and the target";
			if (source && source.volatiles['substitute']) {
				source.volatiles['substitute'].hp -= damage;
				if (source.volatiles['substitute'].hp <= 0) {
					source.removeVolatile('substitute');
					source.subFainted = true;
				} else {
					this.add('-activate', source, 'Substitute', '[damage]');
				}
				this.hint(hint + " has a Substitute, the target's Substitute takes the damage.");
				return damage;
			} else {
				this.hint(hint + " does not have a Substitute there is no damage dealt.");
				return 0;
			}
		}

		damage = target.damage(damage, source, effect);
		switch (effect.id) {
		case 'strugglerecoil':
			this.add('-damage', target, target.getHealth, '[from] recoil');
			break;
		case 'confusion':
			this.add('-damage', target, target.getHealth, '[from] confusion');
			break;
		default:
			this.add('-damage', target, target.getHealth);
			break;
		}
		if (target.fainted) this.faint(target);
		return damage;
	}

	heal(damage: number, target?: Pokemon, source: Pokemon | null = null, effect: 'drain' | Effect | null = null) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (effect === 'drain') effect = this.getEffect(effect);
		if (damage && damage <= 1) damage = 1;
		damage = this.trunc(damage);
		// for things like Liquid Ooze, the Heal event still happens when nothing is healed.
		damage = this.runEvent('TryHeal', target, source, effect, damage);
		if (!damage) return damage;
		if (!target || !target.hp) return false;
		if (!target.isActive) return false;
		if (target.hp >= target.maxhp) return false;
		const finalDamage = target.heal(damage, source, effect);
		switch (effect && effect.id) {
		case 'leechseed':
		case 'rest':
			this.add('-heal', target, target.getHealth, '[silent]');
			break;
		case 'drain':
			this.add('-heal', target, target.getHealth, '[from] drain', '[of] ' + source);
			break;
		case 'wish':
			break;
		case 'zpower':
			this.add('-heal', target, target.getHealth, '[zeffect]');
			break;
		default:
			if (!effect) break;
			if (effect.effectType === 'Move') {
				this.add('-heal', target, target.getHealth);
			} else if (source && source !== target) {
				this.add('-heal', target, target.getHealth, '[from] ' + effect.fullname, '[of] ' + source);
			} else {
				this.add('-heal', target, target.getHealth, '[from] ' + effect.fullname);
			}
			break;
		}
		this.runEvent('Heal', target, source, effect, finalDamage);
		return finalDamage;
	}

	chain(previousMod: number | number[], nextMod: number | number[]) {
		// previousMod or nextMod can be either a number or an array [numerator, denominator]
		if (Array.isArray(previousMod)) {
			previousMod = this.trunc(previousMod[0] * 4096 / previousMod[1]);
		} else {
			previousMod = this.trunc(previousMod * 4096);
		}

		if (Array.isArray(nextMod)) {
			nextMod = this.trunc(nextMod[0] * 4096 / nextMod[1]);
		} else {
			nextMod = this.trunc(nextMod * 4096);
		}
		return ((previousMod * nextMod + 2048) >> 12) / 4096; // M'' = ((M * M') + 0x800) >> 12
	}

	chainModify(numerator: number | number[], denominator?: number) {
		const previousMod = this.trunc(this.event.modifier * 4096);

		if (Array.isArray(numerator)) {
			denominator = numerator[1];
			numerator = numerator[0];
		}
		let nextMod = 0;
		if (this.event.ceilModifier) {
			nextMod = Math.ceil(numerator * 4096 / (denominator || 1));
		} else {
			nextMod = this.trunc(numerator * 4096 / (denominator || 1));
		}

		this.event.modifier = ((previousMod * nextMod + 2048) >> 12) / 4096;
	}

	modify(value: number, numerator: number | number[], denominator?: number) {
		// You can also use:
		// modify(value, [numerator, denominator])
		// modify(value, fraction) - assuming you trust JavaScript's floating-point handler
		if (!denominator) denominator = 1;
		if (Array.isArray(numerator)) {
			denominator = numerator[1];
			numerator = numerator[0];
		}
		const tr = this.trunc;
		const modifier = tr(numerator * 4096 / denominator);
		return tr((tr(value * modifier) + 2048 - 1) / 4096);
	}

	getCategory(move: string | Move) {
		return this.getMove(move).category || 'Physical';
	}

	/**
	 * 0 is a success dealing 0 damage, such as from False Swipe at 1 HP.
	 *
	 * Normal PS return value rules apply:
	 * undefined = success, null = silent failure, false = loud failure
	 */
	getDamage(
		pokemon: Pokemon, target: Pokemon, move: string | number | ActiveMove,
		suppressMessages: boolean = false): number | undefined | null | false {
		if (typeof move === 'string') move = this.getActiveMove(move);

		if (typeof move === 'number') {
			const basePower = move;
			move = (new Data.Move({
				basePower,
				type: '???',
				category: 'Physical',
				willCrit: false,
			})) as ActiveMove;
			move.hit = 0;
		}

		if (!move.ignoreImmunity || (move.ignoreImmunity !== true && !move.ignoreImmunity[move.type])) {
			if (!target.runImmunity(move.type, !suppressMessages)) {
				return false;
			}
		}

		if (move.ohko) return target.maxhp;
		if (move.damageCallback) return move.damageCallback.call(this, pokemon, target);
		if (move.damage === 'level') {
			return pokemon.level;
		} else if (move.damage) {
			return move.damage;
		}

		const category = this.getCategory(move);
		const defensiveCategory = move.defensiveCategory || category;

		let basePower: number | false | null = move.basePower;
		if (move.basePowerCallback) {
			basePower = move.basePowerCallback.call(this, pokemon, target, move);
		}
		if (!basePower) return basePower === 0 ? undefined : basePower;
		basePower = this.clampIntRange(basePower, 1);

		let critMult;
		let critRatio = this.runEvent('ModifyCritRatio', pokemon, target, move, move.critRatio || 0);
		if (this.gen <= 5) {
			critRatio = this.clampIntRange(critRatio, 0, 5);
			critMult = [0, 16, 8, 4, 3, 2];
		} else {
			critRatio = this.clampIntRange(critRatio, 0, 4);
			if (this.gen === 6) {
				critMult = [0, 16, 8, 2, 1];
			} else {
				critMult = [0, 24, 8, 2, 1];
			}
		}

		move.crit = move.willCrit || false;
		if (move.willCrit === undefined) {
			if (critRatio) {
				move.crit = this.randomChance(1, critMult[critRatio]);
			}
		}

		if (move.crit) {
			move.crit = this.runEvent('CriticalHit', target, null, move);
		}

		// happens after crit calculation
		basePower = this.runEvent('BasePower', pokemon, target, move, basePower, true);

		if (!basePower) return 0;
		basePower = this.clampIntRange(basePower, 1);

		const level = pokemon.level;

		const attacker = pokemon;
		const defender = target;
		const attackStat: StatNameExceptHP = category === 'Physical' ? 'atk' : 'spa';
		const defenseStat: StatNameExceptHP = defensiveCategory === 'Physical' ? 'def' : 'spd';
		const statTable = {atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe'};
		let attack;
		let defense;

		let atkBoosts = move.useTargetOffensive ? defender.boosts[attackStat] : attacker.boosts[attackStat];
		let defBoosts = move.useSourceDefensive ? attacker.boosts[defenseStat] : defender.boosts[defenseStat];

		let ignoreNegativeOffensive = !!move.ignoreNegativeOffensive;
		let ignorePositiveDefensive = !!move.ignorePositiveDefensive;

		if (move.crit) {
			ignoreNegativeOffensive = true;
			ignorePositiveDefensive = true;
		}
		const ignoreOffensive = !!(move.ignoreOffensive || (ignoreNegativeOffensive && atkBoosts < 0));
		const ignoreDefensive = !!(move.ignoreDefensive || (ignorePositiveDefensive && defBoosts > 0));

		if (ignoreOffensive) {
			this.debug('Negating (sp)atk boost/penalty.');
			atkBoosts = 0;
		}
		if (ignoreDefensive) {
			this.debug('Negating (sp)def boost/penalty.');
			defBoosts = 0;
		}

		if (move.useTargetOffensive) {
			attack = defender.calculateStat(attackStat, atkBoosts);
		} else {
			attack = attacker.calculateStat(attackStat, atkBoosts);
		}

		if (move.useSourceDefensive) {
			defense = attacker.calculateStat(defenseStat, defBoosts);
		} else {
			defense = defender.calculateStat(defenseStat, defBoosts);
		}

		// Apply Stat Modifiers
		attack = this.runEvent('Modify' + statTable[attackStat], attacker, defender, move, attack);
		defense = this.runEvent('Modify' + statTable[defenseStat], defender, attacker, move, defense);

		const tr = this.trunc;

		// int(int(int(2 * L / 5 + 2) * A * P / D) / 50);
		const baseDamage = tr(tr(tr(tr(2 * level / 5 + 2) * basePower * attack) / defense) / 50);

		// Calculate damage modifiers separately (order differs between generations)
		return this.modifyDamage(baseDamage, pokemon, target, move, suppressMessages);
	}

	modifyDamage(
		baseDamage: number, pokemon: Pokemon, target: Pokemon, move: ActiveMove, suppressMessages: boolean = false
	) {
		const tr = this.trunc;
		if (!move.type) move.type = '???';
		const type = move.type;

		baseDamage += 2;

		// multi-target modifier (doubles only)
		if (move.spreadHit) {
			const spreadModifier = move.spreadModifier || (this.gameType === 'free-for-all' ? 0.5 : 0.75);
			this.debug('Spread modifier: ' + spreadModifier);
			baseDamage = this.modify(baseDamage, spreadModifier);
		}

		// weather modifier
		baseDamage = this.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);

		// crit - not a modifier
		if (move.crit) {
			baseDamage = tr(baseDamage * (move.critModifier || (this.gen >= 6 ? 1.5 : 2)));
		}

		// random factor - also not a modifier
		baseDamage = this.randomizer(baseDamage);

		// STAB
		if (move.forceSTAB || (type !== '???' && pokemon.hasType(type))) {
			// The "???" type never gets STAB
			// Not even if you Roost in Gen 4 and somehow manage to use
			// Struggle in the same turn.
			// (On second thought, it might be easier to get a Missingno.)
			baseDamage = this.modify(baseDamage, move.stab || 1.5);
		}
		// types
		move.typeMod = target.runEffectiveness(move);

		move.typeMod = this.clampIntRange(move.typeMod, -6, 6);
		if (move.typeMod > 0) {
			if (!suppressMessages) this.add('-supereffective', target);

			for (let i = 0; i < move.typeMod; i++) {
				baseDamage *= 2;
			}
		}
		if (move.typeMod < 0) {
			if (!suppressMessages) this.add('-resisted', target);

			for (let i = 0; i > move.typeMod; i--) {
				baseDamage = tr(baseDamage / 2);
			}
		}

		if (move.crit && !suppressMessages) this.add('-crit', target);

		if (pokemon.status === 'brn' && move.category === 'Physical' && !pokemon.hasAbility('guts')) {
			if (this.gen < 6 || move.id !== 'facade') {
				baseDamage = this.modify(baseDamage, 0.5);
			}
		}

		// Generation 5, but nothing later, sets damage to 1 before the final damage modifiers
		if (this.gen === 5 && !baseDamage) baseDamage = 1;

		// Final modifier. Modifiers that modify damage after min damage check, such as Life Orb.
		baseDamage = this.runEvent('ModifyDamage', pokemon, target, move, baseDamage);

		if (move.isZPowered && move.zBrokeProtect) {
			baseDamage = this.modify(baseDamage, 0.25);
			this.add('-zbroken', target);
		}

		// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
		if (this.gen !== 5 && !baseDamage) return 1;

		// ...but 16-bit truncation happens even later, and can truncate to 0
		return tr(baseDamage, 16);
	}

	randomizer(baseDamage: number) {
		const tr = this.trunc;
		return tr(tr(baseDamage * (100 - this.random(16))) / 100);
	}

	/**
	 * Returns whether a proposed target for a move is valid.
	 */
	validTargetLoc(targetLoc: number, source: Pokemon, targetType: string) {
		if (targetLoc === 0) return true;
		const numSlots = source.side.active.length;
		if (Math.abs(targetLoc) > numSlots) return false;

		const sourceLoc = -(source.position + 1);
		const isFoe = (targetLoc > 0);
		const acrossFromTargetLoc = -(numSlots + 1 - targetLoc);
		const isAdjacent = (isFoe ?
			Math.abs(acrossFromTargetLoc - sourceLoc) <= 1 :
			Math.abs(targetLoc - sourceLoc) === 1);
		const isSelf = (sourceLoc === targetLoc);

		switch (targetType) {
		case 'randomNormal':
		case 'scripted':
		case 'normal':
			return isAdjacent;
		case 'adjacentAlly':
			return isAdjacent && !isFoe;
		case 'adjacentAllyOrSelf':
			return isAdjacent && !isFoe || isSelf;
		case 'adjacentFoe':
			return isAdjacent && isFoe;
		case 'any':
			return !isSelf;
		}
		return false;
	}

	getTargetLoc(target: Pokemon, source: Pokemon) {
		const position = target.position + 1;
		return (target.side === source.side) ? -position : position;
	}

	validTarget(target: Pokemon, source: Pokemon, targetType: string) {
		return this.validTargetLoc(this.getTargetLoc(target, source), source, targetType);
	}

	getTarget(pokemon: Pokemon, move: string | Move, targetLoc: number) {
		move = this.getMove(move);
		let target;
		// Fails if the target is the user and the move can't target its own position
		if (['adjacentAlly', 'any', 'normal'].includes(move.target) && targetLoc === -(pokemon.position + 1) &&
				!pokemon.volatiles['twoturnmove'] && !pokemon.volatiles['iceball'] && !pokemon.volatiles['rollout']) {
			return move.isFutureMove ? pokemon : null;
		}
		if (move.target !== 'randomNormal' && this.validTargetLoc(targetLoc, pokemon, move.target)) {
			if (targetLoc > 0) {
				target = pokemon.side.foe.active[targetLoc - 1];
			} else {
				target = pokemon.side.active[-targetLoc - 1];
			}
			if (target && !(target.fainted && target.side !== pokemon.side)) {
				// Target is unfainted: no need to retarget
				// Or target is a fainted ally: attack shouldn't retarget
				return target;
			}

			// Chosen target not valid,
			// retarget randomly with resolveTarget
		}
		return this.resolveTarget(pokemon, move);
	}

	resolveTarget(pokemon: Pokemon, move: string | Move) {
		// A move was used without a chosen target

		// For instance: Metronome chooses Ice Beam. Since the user didn't
		// choose a target when choosing Metronome, Ice Beam's target must
		// be chosen randomly.

		// The target is chosen randomly from possible targets, EXCEPT that
		// moves that can target either allies or foes will only target foes
		// when used without an explicit target.

		move = this.getMove(move);
		if (move.target === 'adjacentAlly') {
			const allyActives = pokemon.side.active;
			let adjacentAllies = [allyActives[pokemon.position - 1], allyActives[pokemon.position + 1]];
			adjacentAllies = adjacentAllies.filter(active => active && !active.fainted);
			return adjacentAllies.length ? this.sample(adjacentAllies) : null;
		}
		if (move.target === 'self' || move.target === 'all' || move.target === 'allySide' ||
				move.target === 'allyTeam' || move.target === 'adjacentAllyOrSelf') {
			return pokemon;
		}
		if (pokemon.side.active.length > 2) {
			if (move.target === 'adjacentFoe' || move.target === 'normal' || move.target === 'randomNormal') {
				// even if a move can target an ally, auto-resolution will never make it target an ally
				// i.e. if both your opponents faint before you use Flamethrower, it will fail instead of targeting your all
				const foeActives = pokemon.side.foe.active;
				const frontPosition = foeActives.length - 1 - pokemon.position;
				let adjacentFoes = foeActives.slice(frontPosition < 1 ? 0 : frontPosition - 1, frontPosition + 2);
				adjacentFoes = adjacentFoes.filter(active => active && !active.fainted);
				if (adjacentFoes.length) return this.sample(adjacentFoes);
				// no valid target at all, return a foe for any possible redirection
			}
		}
		return pokemon.side.foe.randomActive() || pokemon.side.foe.active[0];
	}

	checkFainted() {
		for (const side of this.sides) {
			for (const pokemon of side.active) {
				if (pokemon.fainted) {
					pokemon.status = 'fnt';
					pokemon.switchFlag = true;
				}
			}
		}
	}

	faintMessages(lastFirst: boolean = false) {
		if (this.ended) return;
		if (!this.faintQueue.length) return false;
		if (lastFirst) {
			this.faintQueue.unshift(this.faintQueue[this.faintQueue.length - 1]);
			this.faintQueue.pop();
		}
		let faintData;
		while (this.faintQueue.length) {
			faintData = this.faintQueue[0];
			this.faintQueue.shift();
			if (!faintData.target.fainted &&
					this.runEvent('BeforeFaint', faintData.target, faintData.source, faintData.effect)) {
				this.add('faint', faintData.target);
				faintData.target.side.pokemonLeft--;
				this.runEvent('Faint', faintData.target, faintData.source, faintData.effect);
				this.singleEvent('End', this.getAbility(faintData.target.ability), faintData.target.abilityData, faintData.target);
				faintData.target.clearVolatile(false);
				faintData.target.fainted = true;
				faintData.target.isActive = false;
				faintData.target.isStarted = false;
				faintData.target.side.faintedThisTurn = true;
			}
		}

		if (this.gen <= 1) {
			// in gen 1, fainting skips the rest of the turn
			// residuals don't exist in gen 1
			this.queue = [];
		} else if (this.gen <= 3 && this.gameType === 'singles') {
			// in gen 3 or earlier, fainting in singles skips to residuals
			for (const pokemon of this.getAllActive()) {
				if (this.gen <= 2) {
					// in gen 2, fainting skips moves only
					this.cancelMove(pokemon);
				} else {
					// in gen 3, fainting skips all moves and switches
					this.cancelAction(pokemon);
				}
			}
		}

		let team1PokemonLeft = this.sides[0].pokemonLeft;
		let team2PokemonLeft = this.sides[1].pokemonLeft;
		const team3PokemonLeft = this.gameType === 'free-for-all' && this.sides[2]!.pokemonLeft;
		const team4PokemonLeft = this.gameType === 'free-for-all' && this.sides[3]!.pokemonLeft;
		if (this.gameType === 'multi') {
			team1PokemonLeft = this.sides.reduce((total, side) => total + (side.n % 2 === 0 ? side.pokemonLeft : 0), 0);
			team2PokemonLeft = this.sides.reduce((total, side) => total + (side.n % 2 === 1 ? side.pokemonLeft : 0), 0);
		}
		if (!team1PokemonLeft && !team2PokemonLeft && !team3PokemonLeft && !team4PokemonLeft) {
			this.win(faintData ? faintData.target.side : null);
			return true;
		}
		if (!team2PokemonLeft && !team3PokemonLeft && !team4PokemonLeft) {
			this.win(this.sides[0]);
			return true;
		}
		if (!team1PokemonLeft && !team3PokemonLeft && !team4PokemonLeft) {
			this.win(this.sides[1]);
			return true;
		}
		if (!team1PokemonLeft && !team2PokemonLeft && !team4PokemonLeft) {
			this.win(this.sides[2]);
			return true;
		}
		if (!team1PokemonLeft && !team2PokemonLeft && !team3PokemonLeft) {
			this.win(this.sides[3]);
			return true;
		}
		return false;
	}

	/**
	 * Takes an object describing an action, and fills it out into a full
	 * Action object.
	 */
	resolveAction(action: AnyObject, midTurn: boolean = false): Actions["Action"] {
		if (!action) throw new Error(`Action not passed to resolveAction`);

		if (!action.side && action.pokemon) action.side = action.pokemon.side;
		if (!action.move && action.moveid) action.move = this.getActiveMove(action.moveid);
		if (!action.choice && action.move) action.choice = 'move';
		if (!action.priority && action.priority !== 0) {
			const priorities = {
				beforeTurn: 100,
				beforeTurnMove: 99,
				switch: 7,
				runUnnerve: 7.3,
				runSwitch: 7.2,
				runPrimal: 7.1,
				instaswitch: 101,
				megaEvo: 6.9,
				residual: -100,
				team: 102,
				start: 101,
			};
			if (action.choice in priorities) {
				// @ts-ignore - Typescript being dumb about index signatures
				action.priority = priorities[action.choice];
			}
		}
		if (!midTurn) {
			if (action.choice === 'move') {
				if (!action.zmove && action.move.beforeTurnCallback) {
					this.addToQueue({
						choice: 'beforeTurnMove', pokemon: action.pokemon, move: action.move, targetLoc: action.targetLoc,
					});
				}
				if (action.mega) {
					// TODO: Check that the Pokémon is not affected by Sky Drop.
					// (This is currently being done in `runMegaEvo`).
					this.addToQueue({
						choice: 'megaEvo',
						pokemon: action.pokemon,
					});
				}
			} else if (action.choice === 'switch' || action.choice === 'instaswitch') {
				if (typeof action.pokemon.switchFlag === 'string') {
					action.sourceEffect = this.getEffect(action.pokemon.switchFlag);
				}
				action.pokemon.switchFlag = false;
				if (!action.speed) action.speed = action.pokemon.getActionSpeed();
			}
		}

		const deferPriority = this.gen >= 7 && action.mega && action.mega !== 'done';
		if (action.move) {
			let target = null;
			action.move = this.getActiveMove(action.move);

			if (!action.targetLoc) {
				target = this.resolveTarget(action.pokemon, action.move);
				// TODO: what actually happens here?
				if (target) action.targetLoc = this.getTargetLoc(target, action.pokemon);
			}

			if (!action.priority && !deferPriority) {
				let move = action.move;
				if (action.zmove) {
					const zMoveName = this.getZMove(action.move, action.pokemon, true);
					if (zMoveName) {
						const zMove = this.getActiveMove(zMoveName);
						if (zMove.exists && zMove.isZ) {
							move = zMove;
						}
					}
				}
				const priority = this.runEvent('ModifyPriority', action.pokemon, target, move, move.priority);
				action.priority = priority;
				// In Gen 6, Quick Guard blocks moves with artificially enhanced priority.
				if (this.gen > 5) action.move.priority = priority;
			}
		}
		if (!action.speed) {
			if ((action.choice === 'switch' || action.choice === 'instaswitch') && action.target) {
				action.speed = action.target.getActionSpeed();
			} else if (!action.pokemon) {
				action.speed = 1;
			} else if (!deferPriority) {
				action.speed = action.pokemon.getActionSpeed();
			}
		}
		return action as any;
	}

	/**
	 * Adds the action last in the queue. Mostly used before sortQueue.
	 */
	addToQueue(action: AnyObject | AnyObject[]) {
		if (Array.isArray(action)) {
			for (const curAction of action) {
				this.addToQueue(curAction);
			}
			return;
		}

		if (action.choice === 'pass') return;
		this.queue.push(this.resolveAction(action));
	}

	sortQueue() {
		this.speedSort(this.queue);
	}

	/**
	 * Inserts the passed action into the action queue when it normally
	 * would have happened (sorting by priority/speed), without
	 * re-sorting the existing actions.
	 */
	insertQueue(chosenAction: AnyObject | AnyObject[], midTurn: boolean = false) {
		if (Array.isArray(chosenAction)) {
			for (const subAction of chosenAction) {
				this.insertQueue(subAction);
			}
			return;
		}

		if (chosenAction.pokemon) chosenAction.pokemon.updateSpeed();
		const action = this.resolveAction(chosenAction, midTurn);
		for (const [i, curAction] of this.queue.entries()) {
			if (this.comparePriority(action, curAction) < 0) {
				this.queue.splice(i, 0, action);
				return;
			}
		}
		this.queue.push(action);
	}

	/**
	 * Makes the passed action happen next (skipping speed order).
	 */
	prioritizeAction(action: Actions["MoveAction"] | Actions["SwitchAction"], source?: Pokemon, sourceEffect?: Effect) {
		if (this.event && !sourceEffect) sourceEffect = this.effect;
		for (const [i, curAction] of this.queue.entries()) {
			if (curAction === action) {
				this.queue.splice(i, 1);
				break;
			}
		}
		action.sourceEffect = sourceEffect;
		this.queue.unshift(action);
	}

	willAct() {
		for (const action of this.queue) {
			if (['move', 'switch', 'instaswitch', 'shift'].includes(action.choice)) {
				return action;
			}
		}
		return null;
	}

	willMove(pokemon: Pokemon) {
		if (pokemon.fainted) return false;
		for (const action of this.queue) {
			if (action.choice === 'move' && action.pokemon === pokemon) {
				return action;
			}
		}
		return null;
	}

	cancelAction(pokemon: Pokemon) {
		const length = this.queue.length;
		this.queue = this.queue.filter(action =>
			!(action.pokemon === pokemon && action.priority >= -100));
		return this.queue.length !== length;
	}

	cancelMove(pokemon: Pokemon) {
		for (const [i, action] of this.queue.entries()) {
			if (action.choice === 'move' && action.pokemon === pokemon) {
				this.queue.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	willSwitch(pokemon: Pokemon) {
		for (const action of this.queue) {
			if ((action.choice === 'switch' || action.choice === 'instaswitch') && action.pokemon === pokemon) {
				return action;
			}
		}
		return false;
	}

	runAction(action: Actions["Action"]) {
		// returns whether or not we ended in a callback
		switch (action.choice) {
		case 'start': {
			// I GIVE UP, WILL WRESTLE WITH EVENT SYSTEM LATER
			const format = this.getFormat();

			// Remove Pokémon duplicates remaining after `team` decisions.
			for (const side of this.sides) {
				side.pokemon = side.pokemon.slice(0, side.pokemonLeft);
			}

			if (format.teamLength && format.teamLength.battle) {
				// Trim the team: not all of the Pokémon brought to Preview will battle.
				for (const side of this.sides) {
					side.pokemon = side.pokemon.slice(0, format.teamLength.battle);
					side.pokemonLeft = side.pokemon.length;
				}
			}

			this.add('start');
			for (const side of this.sides) {
				for (let pos = 0; pos < side.active.length; pos++) {
					this.switchIn(side.pokemon[pos], pos);
				}
			}
			for (const pokemon of this.getAllPokemon()) {
				this.singleEvent('Start', this.getEffect(pokemon.species), pokemon.speciesData, pokemon);
			}
			this.midTurn = true;
			break;
		}

		case 'move':
			if (!action.pokemon.isActive) return false;
			if (action.pokemon.fainted) return false;
			this.runMove(action.move, action.pokemon, action.targetLoc, action.sourceEffect, action.zmove);
			break;
		case 'megaEvo':
			this.runMegaEvo(action.pokemon);
			break;
		case 'beforeTurnMove': {
			if (!action.pokemon.isActive) return false;
			if (action.pokemon.fainted) return false;
			this.debug('before turn callback: ' + action.move.id);
			const target = this.getTarget(action.pokemon, action.move, action.targetLoc);
			if (!target) return false;
			if (!action.move.beforeTurnCallback) throw new Error(`beforeTurnMove has no beforeTurnCallback`);
			action.move.beforeTurnCallback.call(this, action.pokemon, target);
			break;
		}

		case 'event':
			// @ts-ignore - easier than defining a custom event attribute TBH
			this.runEvent(action.event, action.pokemon);
			break;
		case 'team': {
			action.pokemon.side.pokemon.splice(action.index, 0, action.pokemon);
			action.pokemon.position = action.index;
			// we return here because the update event would crash since there are no active pokemon yet
			return;
		}

		case 'pass':
			return;
		case 'instaswitch':
		case 'switch':
			if (action.choice === 'switch' && action.pokemon.status && this.data.Abilities.naturalcure) {
				this.singleEvent('CheckShow', this.getAbility('naturalcure'), null, action.pokemon);
			}
			if (action.pokemon.hp) {
				action.pokemon.beingCalledBack = true;
				const sourceEffect = action.sourceEffect;
				if (sourceEffect && (sourceEffect as Move).selfSwitch === 'copyvolatile') {
					action.pokemon.switchCopyFlag = true;
				}
				if (!action.pokemon.switchCopyFlag) {
					this.runEvent('BeforeSwitchOut', action.pokemon);
					if (this.gen >= 5) {
						this.eachEvent('Update');
					}
				}
				if (!this.runEvent('SwitchOut', action.pokemon)) {
					// Warning: DO NOT interrupt a switch-out if you just want to trap a pokemon.
					// To trap a pokemon and prevent it from switching out, (e.g. Mean Look, Magnet Pull)
					// use the 'trapped' flag instead.

					// Note: Nothing in BW or earlier interrupts a switch-out.
					break;
				}
			}
			action.pokemon.illusion = null;
			this.singleEvent('End', this.getAbility(action.pokemon.ability), action.pokemon.abilityData, action.pokemon);
			if (!action.pokemon.hp && !action.pokemon.fainted) {
				// a pokemon fainted from Pursuit before it could switch
				if (this.gen <= 4) {
					// in gen 2-4, the switch still happens
					action.priority = -101;
					this.queue.unshift(action);
					this.hint("Previously chosen switches continue in Gen 2-4 after a Pursuit target faints.");
					break;
				}
				// in gen 5+, the switch is cancelled
				this.hint("A Pokemon can't switch between when it runs out of HP and when it faints");
				break;
			}
			if (action.target.isActive) {
				this.hint("A switch failed because the Pokémon trying to switch in is already in.");
				break;
			}
			if (action.choice === 'switch' && action.pokemon.activeTurns === 1) {
				for (const foeActive of action.pokemon.side.foe.active) {
					if (foeActive.isStale >= 2) {
						action.pokemon.isStaleCon++;
						action.pokemon.isStaleSource = 'switch';
						break;
					}
				}
			}

			this.switchIn(action.target, action.pokemon.position, action.sourceEffect);
			break;
		case 'runUnnerve':
			this.singleEvent('PreStart', action.pokemon.getAbility(), action.pokemon.abilityData, action.pokemon);
			break;
		case 'runSwitch':
			this.runEvent('SwitchIn', action.pokemon);
			if (this.gen <= 2 && !action.pokemon.side.faintedThisTurn && action.pokemon.draggedIn !== this.turn) {
				this.runEvent('AfterSwitchInSelf', action.pokemon);
			}
			if (!action.pokemon.hp) break;
			action.pokemon.isStarted = true;
			if (!action.pokemon.fainted) {
				this.singleEvent('Start', action.pokemon.getAbility(), action.pokemon.abilityData, action.pokemon);
				action.pokemon.abilityOrder = this.abilityOrder++;
				this.singleEvent('Start', action.pokemon.getItem(), action.pokemon.itemData, action.pokemon);
			}
			if (this.gen === 4) {
				for (const foeActive of action.pokemon.side.foe.active) {
					foeActive.removeVolatile('substitutebroken');
				}
			}
			delete action.pokemon.draggedIn;
			break;
		case 'runPrimal':
			if (!action.pokemon.transformed) {
				this.singleEvent('Primal', action.pokemon.getItem(), action.pokemon.itemData, action.pokemon);
			}
			break;
		case 'shift': {
			if (!action.pokemon.isActive) return false;
			if (action.pokemon.fainted) return false;
			action.pokemon.activeTurns--;
			this.swapPosition(action.pokemon, 1);
			for (const foeActive of action.pokemon.side.foe.active) {
				if (foeActive.isStale >= 2) {
					action.pokemon.isStaleCon++;
					action.pokemon.isStaleSource = 'switch';
					break;
				}
			}
			break;
		}

		case 'beforeTurn':
			this.eachEvent('BeforeTurn');
			break;
		case 'residual':
			this.add('');
			this.clearActiveMove(true);
			this.updateSpeed();
			this.residualEvent('Residual');
			this.add('upkeep');
			break;
		}

		// phazing (Roar, etc)
		for (const side of this.sides) {
			for (const pokemon of side.active) {
				if (pokemon.forceSwitchFlag) {
					if (pokemon.hp) this.dragIn(pokemon.side, pokemon.position);
					pokemon.forceSwitchFlag = false;
				}
			}
		}

		this.clearActiveMove();

		// fainting

		this.faintMessages();
		if (this.ended) return true;

		// switching (fainted pokemon, U-turn, Baton Pass, etc)

		if (!this.queue.length || (this.gen <= 3 && ['move', 'residual'].includes(this.queue[0].choice))) {
			// in gen 3 or earlier, switching in fainted pokemon is done after
			// every move, rather than only at the end of the turn.
			this.checkFainted();
		} else if (action.choice === 'megaEvo' && this.gen >= 7) {
			this.eachEvent('Update');
			// In Gen 7, the action order is recalculated for a Pokémon that mega evolves.
			const moveIndex = this.queue.findIndex(queuedAction =>
				queuedAction.pokemon === action.pokemon && queuedAction.choice === 'move'
			);
			if (moveIndex >= 0) {
				const moveAction = this.queue.splice(moveIndex, 1)[0] as Actions["MoveAction"];
				moveAction.mega = 'done';
				this.insertQueue(moveAction, true);
			}
			return false;
		} else if (this.queue.length && this.queue[0].choice === 'instaswitch') {
			return false;
		}

		const switches = this.sides.map(side =>
			side.active.some(pokemon => pokemon && !!pokemon.switchFlag)
		);

		for (let i = 0; i < this.sides.length; i++) {
			if (switches[i] && !this.canSwitch(this.sides[i])) {
				for (const pokemon of this.sides[i].active) {
					pokemon.switchFlag = false;
				}
				switches[i] = false;
			}
		}

		for (const playerSwitch of switches) {
			if (playerSwitch) {
				if (this.gen >= 5) {
					this.eachEvent('Update');
				}
				this.makeRequest('switch');
				return true;
			}
		}

		this.eachEvent('Update');

		return false;
	}

	go() {
		this.add('');
		if (this.requestState) this.requestState = '';

		if (!this.midTurn) {
			this.queue.push(this.resolveAction({choice: 'residual'}));
			this.queue.unshift(this.resolveAction({choice: 'beforeTurn'}));
			this.midTurn = true;
		}

		while (this.queue.length) {
			const action = this.queue[0];
			this.queue.shift();
			this.runAction(action);
			if (this.requestState || this.ended) return;
		}

		this.nextTurn();
		this.midTurn = false;
		this.queue = [];
	}

	/**
	 * Changes a pokemon's action, and inserts its new action
	 * in priority order.
	 *
	 * You'd normally want the OverrideAction event (which doesn't
	 * change priority order).
	 */
	changeAction(pokemon: Pokemon, action: AnyObject) {
		this.cancelAction(pokemon);
		if (!action.pokemon) action.pokemon = pokemon;
		this.insertQueue(action);
	}

	/**
	 * Takes a choice string passed from the client. Starts the next
	 * turn if all required choices have been made.
	 */
	choose(sideid: SideID, input: string) {
		const side = this.getSide(sideid);

		if (!side.choose(input)) return false;

		if (!side.isChoiceDone()) {
			side.emitChoiceError(`Incomplete choice: ${input} - missing other pokemon`);
			return false;
		}
		if (this.allChoicesDone()) this.commitDecisions();
		return true;
	}

	/**
	 * Convenience method for easily making choices.
	 */
	makeChoices(...inputs: string[]) {
		if (inputs.length) {
			for (const [i, input] of inputs.entries()) {
				if (input) this.sides[i].choose(input);
			}
		} else {
			for (const side of this.sides) {
				side.autoChoose();
			}
		}
		this.commitDecisions();
	}

	commitDecisions() {
		this.updateSpeed();

		const oldQueue = this.queue;
		this.queue = [];
		if (!this.allChoicesDone()) throw new Error("Not all choices done");

		for (const side of this.sides) {
			const choice = side.getChoice();
			if (choice) this.inputLog.push(`>${side.id} ${choice}`);
		}
		for (const side of this.sides) {
			this.addToQueue(side.choice.actions);
		}

		this.sortQueue();
		this.queue.push(...oldQueue);

		this.requestState = '';
		for (const side of this.sides) {
			side.activeRequest = null;
		}

		this.go();
	}

	undoChoice(sideid: SideID) {
		const side = this.getSide(sideid);
		if (!side.requestState) return;

		if (side.choice.cantUndo) {
			side.emitChoiceError(`Can't undo: A trapping/disabling effect would cause undo to leak information`);
			return;
		}

		side.clearChoice();
	}

	/**
	 * returns true if both decisions are complete
	 */
	allChoicesDone() {
		let totalActions = 0;
		for (const side of this.sides) {
			if (side.isChoiceDone()) {
				if (!this.supportCancel) side.choice.cantUndo = true;
				totalActions++;
			}
		}
		return totalActions >= this.sides.length;
	}

	hint(hint: string, once?: boolean, side?: Side) {
		if (this.hints.has(hint)) return;

		if (side) {
			this.add('split');
			for (const line of [false, 0, 1, true]) {
				if (line === true || line === side.n % 2) {
					this.add('-hint', hint);
				} else {
					this.log.push('');
				}
			}
		} else {
			this.add('-hint', hint);
		}

		if (once) this.hints.add(hint);
	}

	add(...parts: (string | number | boolean | ((side: 0 | 1 | boolean) => string) | AnyObject | null | undefined)[]) {
		if (!parts.some(part => typeof part === 'function')) {
			this.log.push(`|${parts.join('|')}`);
			return;
		}
		if (this.reportExactHP) {
			parts = parts.map(part =>
				typeof part !== 'function' ? part : part(true)
			);
			this.log.push(`|${parts.join('|')}`);
			return;
		}
		this.log.push('|split');
		const sides: (0 | 1 | boolean)[] = [false, 0, 1, true];
		for (const side of sides) {
			const sideUpdate = '|' + parts.map(part =>
				typeof part !== 'function' ? part : part(side)
			).join('|');
			this.log.push(sideUpdate);
		}
	}

	// tslint:disable-next-line:ban-types
	addMove(...args: (string | number | Function | AnyObject)[]) {
		this.lastMoveLine = this.log.length;
		this.log.push(`|${args.join('|')}`);
	}

	// tslint:disable-next-line:ban-types
	attrLastMove(...args: (string | number | Function | AnyObject)[]) {
		if (this.lastMoveLine < 0) return;
		if (this.log[this.lastMoveLine].startsWith('|-anim|')) {
			if (args.includes('[still]')) {
				this.log.splice(this.lastMoveLine, 1);
				this.lastMoveLine = -1;
				return;
			}
		} else if (args.includes('[still]')) {
			// If no animation plays, the target should never be known
			const parts = this.log[this.lastMoveLine].split('|');
			parts[4] = '';
			this.log[this.lastMoveLine] = parts.join('|');
		}
		this.log[this.lastMoveLine] += `|${args.join('|')}`;
	}

	retargetLastMove(newTarget: Pokemon) {
		if (this.lastMoveLine < 0) return;
		const parts = this.log[this.lastMoveLine].split('|');
		parts[4] = newTarget.toString();
		this.log[this.lastMoveLine] = parts.join('|');
	}

	debug(activity: string) {
		if (this.debugMode) {
			this.add('debug', activity);
		}
	}

	getDebugLog() {
		return this.log.join('\n').replace(/\|split\n.*\n.*\n.*\n/g, '');
	}

	debugError(activity: string) {
		this.add('debug', activity);
	}

	// players

	getTeam(options: PlayerOptions): PokemonSet[] {
		const format = this.getFormat();
		let team = options.team;
		if (typeof team === 'string') team = Dex.fastUnpackTeam(team);
		if (!format.team && team) return team;

		if (!options.seed) {
			options.seed = PRNG.generateSeed();
		}

		if (!this.teamGenerator) {
			this.teamGenerator = this.getTeamGenerator(format, options.seed);
		} else {
			this.teamGenerator.setSeed(options.seed);
		}

		team = this.teamGenerator.getTeam(options);
		return team as PokemonSet[];
	}

	setPlayer(slot: SideID, options: PlayerOptions) {
		let side;
		let didSomething = true;
		const slotNum = parseInt(slot[1], 10) - 1;
		if (!this.sides[slotNum]) {
			// create player
			const team = this.getTeam(options);
			side = new Side(options.name || `Player ${slotNum + 1}`, this, slotNum, team);
			if (options.avatar) side.avatar = '' + options.avatar;
			this.sides[slotNum] = side;
		} else {
			// edit player
			side = this.sides[slotNum];
			didSomething = false;
			if (options.name && side.name !== options.name) {
				side.name = options.name;
				didSomething = true;
			}
			if (options.avatar && side.avatar !== '' + options.avatar) {
				side.avatar = '' + options.avatar;
				didSomething = true;
			}
			if (options.team) throw new Error(`Player ${slot} already has a team!`);
		}
		if (options.team && typeof options.team !== 'string') {
			options.team = this.packTeam(options.team);
		}
		if (!didSomething) return;
		this.inputLog.push(`>player ${slot} ` + JSON.stringify(options));
		this.add('player', side.id, side.name, side.avatar);
		this.start();
	}

	/** @deprecated */
	join(slot: SideID, name: string, avatar: string, team: PokemonSet[] | string | null) {
		this.setPlayer(slot, {name, avatar, team});
		return this.getSide(slot);
	}

	sendUpdates() {
		if (this.sentLogPos >= this.log.length) return;
		this.send('update', this.log.slice(this.sentLogPos));
		this.sentLogPos = this.log.length;

		if (!this.sentEnd && this.ended) {
			const log = {
				winner: this.winner,
				seed: this.prngSeed,
				turns: this.turn,
				p1: this.sides[0].name,
				p2: this.sides[1].name,
				p3: this.sides[2] && this.sides[2].name,
				p4: this.sides[3] && this.sides[3].name,
				p1team: this.sides[0].team,
				p2team: this.sides[1].team,
				p3team: this.sides[2] && this.sides[2].team,
				p4team: this.sides[3] && this.sides[3].team,
				score: [this.sides[0].pokemonLeft, this.sides[1].pokemonLeft],
				inputLog: this.inputLog,
			};
			if (this.sides[2]) {
				log.score.push(this.sides[2].pokemonLeft);
			} else {
				delete log.p3;
				delete log.p3team;
			}
			if (this.sides[3]) {
				log.score.push(this.sides[3].pokemonLeft);
			} else {
				delete log.p4;
				delete log.p4team;
			}
			this.send('end', JSON.stringify(log));
			this.sentEnd = true;
		}
	}

	combineResults<T extends number | boolean | null | '' | undefined,
		U extends number | boolean | null | '' | undefined>(
		left: T, right: U
	): T | U {
		const NOT_FAILURE = 'string';
		const NULL = 'object';
		const resultsPriorities = ['undefined', NOT_FAILURE, NULL, 'boolean', 'number'];
		if (resultsPriorities.indexOf(typeof left) > resultsPriorities.indexOf(typeof right)) {
			return left;
		} else if (left && !right && right !== 0) {
			return left;
		} else if (typeof left === 'number' && typeof right === 'number') {
			return (left + right) as T;
		} else {
			return right;
		}
	}

	getSide(sideid: SideID): Side {
		return this.sides[parseInt(sideid[1], 10) - 1];
	}

	afterMoveSecondaryEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): undefined {
		throw new UnimplementedError('afterMoveSecondary');
	}

	calcRecoilDamage(damageDealt: number, move: Move): number {
		throw new UnimplementedError('calcRecoilDamage');
	}

	canMegaEvo(pokemon: Pokemon): string | null | undefined {
		throw new UnimplementedError('canMegaEvo');
	}

	canUltraBurst(pokemon: Pokemon): string | null {
		throw new UnimplementedError('canUltraBurst');
	}

	canZMove(pokemon: Pokemon): (AnyObject | null)[] | void {
		throw new UnimplementedError('canZMove');
	}

	forceSwitch(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove,
		moveData: ActiveMove, isSecondary?: boolean, isSelf?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('forceSwitch');
	}

	getActiveZMove(move: Move, pokemon: Pokemon): ActiveMove {
		throw new UnimplementedError('getActiveZMove');
	}

	getSpreadDamage(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove,
		moveData: ActiveMove, isSecondary?: boolean, isSelf?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('getSpreadDamage');
	}

	getZMove(move: Move, pokemon: Pokemon, skipChecks?: boolean): string | undefined {
		throw new UnimplementedError('getZMove');
	}

	hitStepAccuracy(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean[] {
		throw new UnimplementedError('hitStepAccuracy');
	}

	hitStepBreakProtect(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): undefined {
		throw new UnimplementedError('hitStepBreakProtect');
	}

	hitStepMoveHitLoop(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): SpreadMoveDamage {
		throw new UnimplementedError('hitStepMoveHitLoop');
	}

	hitStepPowderImmunity(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean[] {
		throw new UnimplementedError('hitStepPowderImmunity');
	}

	hitStepPranksterImmunity(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean[] {
		throw new UnimplementedError('hitStepPranksterImmunity');
	}

	hitStepStealBoosts(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): undefined {
		throw new UnimplementedError('hitStepStealBoosts');
	}

	hitStepTryHitEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): (boolean | '')[] {
		throw new UnimplementedError('hitStepTryHitEvent');
	}

	hitStepTryImmunityEvent(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean[] {
		throw new UnimplementedError('hitStepTryImmunityEvent ');
	}

	hitStepTypeImmunity(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean[] {
		throw new UnimplementedError('hitStepTypeImmunity');
	}

	isAdjacent(pokemon1: Pokemon, pokemon2: Pokemon): boolean {
		throw new UnimplementedError('isAdjacent');
	}

	moveHit(
		target: Pokemon | null, pokemon: Pokemon, move: ActiveMove,
		moveData?: ActiveMove | SelfEffect | SecondaryEffect,
		isSecondary?: boolean, isSelf?: boolean
	): number | undefined | false {
		throw new UnimplementedError('moveHit');
	}

	/**
	 * This function is also used for Ultra Bursting.
	 * Takes the Pokemon that will Mega Evolve or Ultra Burst as a parameter.
	 * Returns false if the Pokemon cannot Mega Evolve or Ultra Burst, otherwise returns true.
	 */
	runMegaEvo(pokemon: Pokemon): boolean {
		throw new UnimplementedError('runMegaEvo');
	}

	runMove(
		moveOrMoveName: Move | string, pokemon: Pokemon, targetLoc: number,
		sourceEffect?: Effect | null, zMove?: string, externalMove?: boolean
	) {
		throw new UnimplementedError('runMove');
	}

	runMoveEffects(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove,
		moveData: ActiveMove, isSecondary?: boolean, isSelf?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('runMoveEffects');
	}

	runZPower(move: ActiveMove, pokemon: Pokemon) {
		throw new UnimplementedError('runZPower');
	}

	secondaries(
		targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove, moveData: ActiveMove,
		isSelf?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('secondaries');
	}

	selfDrops(
		targets: SpreadMoveTargets, source: Pokemon, move: ActiveMove, moveData: ActiveMove,
		isSecondary?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('selfDrops');
	}

	spreadMoveHit(
		targets: SpreadMoveTargets, pokemon: Pokemon, move: ActiveMove, moveData?: ActiveMove,
		isSecondary?: boolean, isSelf?: boolean
	): [SpreadMoveDamage, SpreadMoveTargets] {
		throw new UnimplementedError('spreadMoveHit');
	}

	targetTypeChoices(targetType: string): boolean {
		throw new UnimplementedError('targetTypeChoices');
	}

	tryMoveHit(target: Pokemon, pokemon: Pokemon, move: ActiveMove): number | undefined | false | '' {
		throw new UnimplementedError('tryMoveHit');
	}

	tryPrimaryHitEvent(
		damage: SpreadMoveDamage, targets: SpreadMoveTargets, pokemon: Pokemon, move: ActiveMove,
		moveData: ActiveMove, isSecondary?: boolean
	): SpreadMoveDamage {
		throw new UnimplementedError('tryPrimaryHitEvent');
	}

	trySpreadMoveHit(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove): boolean {
		throw new UnimplementedError('trySpreadMoveHit');
	}

	useMove(
		move: string | Move, pokemon: Pokemon, target?: Pokemon | null,
		sourceEffect?: Effect | null, zMove?: string
	): boolean {
		throw new UnimplementedError('useMove');
	}

	/**
	 * target = undefined: automatically resolve target
	 * target = null: no target (move will fail)
	 */
	useMoveInner(
		move: string | Move, pokemon: Pokemon, target?: Pokemon | null,
		sourceEffect?: Effect | null, zMove?: string
	): boolean {
		throw new UnimplementedError('useMoveInner');
	}

	destroy() {
		// deallocate ourself

		// deallocate children and get rid of references to them
		this.field.destroy();
		// @ts-ignore - readonly
		this.field = null!;

		for (let i = 0; i < this.sides.length; i++) {
			if (this.sides[i]) {
				this.sides[i].destroy();
				this.sides[i] = null!;
			}
		}
		for (const action of this.queue) {
			delete action.pokemon;
		}

		this.queue = [];
		// in case the garbage collector really sucks, at least deallocate the log
		// @ts-ignore - readonly
		this.log = [];
	}
}

class UnimplementedError extends Error {
	constructor(name: string) {
		super(`The ${name} function needs to be implemented in scripts.js or the battle format.`);
		this.name = 'UnimplementedError';
	}
}
