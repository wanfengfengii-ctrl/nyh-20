
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/export" | "/map" | "/share" | "/share/\\[token]" | "/share/[token]" | "/species" | "/statistics" | "/warning";
		RouteParams(): {
			"/share/\\[token]": { token: string };
			"/share/[token]": { token: string }
		};
		LayoutParams(): {
			"/": { token?: string | undefined };
			"/export": Record<string, never>;
			"/map": Record<string, never>;
			"/share": { token?: string | undefined };
			"/share/\\[token]": { token: string };
			"/share/[token]": { token: string };
			"/species": Record<string, never>;
			"/statistics": Record<string, never>;
			"/warning": Record<string, never>
		};
		Pathname(): "/" | "/export" | "/map" | `/share/${string}` & {} | "/species" | "/statistics" | "/warning";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}