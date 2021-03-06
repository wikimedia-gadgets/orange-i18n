export interface Messages {
	[ messageKey: string ]: string|Record<string, any>;
}

export interface BananaOptions {
	messages?: Messages | MessageSource;
	finalFallback?: string;
	wikilinks?: boolean;
}

export interface BananaConstructor {
	new ( locale: string, options?: BananaOptions ): Banana;
}

export type MessageSource = Record<string, Messages>;

export type ParameterType = string|object|number|undefined;

export interface Banana {
	locale: string;
	load( messageSource: Messages | MessageSource, locale?: string ): void;
	i18n( key: string, ...params: ParameterType[] ): string;
	setLocale( locale: string ): void;
	getFallbackLocales(): string[];
	setFallbackLocales( locales: string[] ): void;
	setPluralRules( locale: string, rule: Record<"zero"|"one"|"two"|"few"|"many"|"other", string> ): void;
	setDigitTransforms( locale: string, transforms: string ): void;
	getMessage( messageKey: string ): string;
	registerParserPlugin( name: string, plugin: ((nodes: ParameterType[]) => string) ): void;
}

export const Banana: BananaConstructor;
