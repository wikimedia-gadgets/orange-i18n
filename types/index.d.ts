export default class Banana {
	constructor(locale: string, options?: BananaOptions);
	locale: string;
	parser: BananaParser;
	messageStore: BananaMessageStore;
	finalFallback: string;

	load(messageSource: MessageSource): void;
	load(messageSource: Messages, locale: string): void;
	i18n(key: string, ...params: ParameterType[]): string;
	setLocale(locale: string): void;
	getFallbackLocales(): string[];
	getMessage(messageKey: string): string;
}

export interface BananaOptions {
	messages?: Messages;
	finalFallback?: string;
}

export interface Messages {
	[messageKey: string]: string;
}

export interface MessageSource {
	[localizer: string]: Messages;
}

export type ParameterType = string | object | number | undefined;

export class BananaParser {
	constructor (locale: string, options?: { wikilinks: boolean });
	locale: string;
	wikilinks: boolean;
	emitter: BananaEmitter;
}

export class BananaEmitter {
	constructor(locale: string);
	emit(node: any, replacements: any): any;
	concat(nodes: any): string;
	replace (nodes: any, replacements: any): string;
	plural(nodes: any): string;
	gender(nodes: any): string;
	grammar(nodes: any): string;
	wikilink(nodes: any): string;
	extlink(nodes: any): string;
	bidi(nodes: any): string;
	formatnum(nodes: any): string;
}

export class BananaMessageStore {
	constructor();
	load(messageSource: MessageSource): void;
	load(messageSource: Messages, locale: string): void;
	getMessage(key: string, locale: string): string;
	hasLocale(locale: string): boolean;
}
