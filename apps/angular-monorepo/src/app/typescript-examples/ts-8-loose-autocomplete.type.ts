// This is just for autocomplition where we can pass even string

type ITWorkers = 'Frontend' | 'Backend' | 'QA' | string;

type ITWorkersAutocomplete = 'Frontend' | 'Backend' | 'QA' | (string & {}); // Magic

/**
 * @param a - is considered as string
 * @param b - is considered as  'Frontend' | 'Backend' | 'QA' but u could also provide a string
 */
function typedFn(a: ITWorkers, b: ITWorkersAutocomplete) {
  return a + b;
}

// Or just with type
type LooseAutocomplete<T extends string> = T | Omit<string , T>

