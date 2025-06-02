
type ValueOptional = {
  props: string | undefined;
}

type KeyOptional = {
  props?: string;
}

// ✅ VALID but we prbbly would like to know that when we use it somewhere else
// we know that this value exists, and if it is important enough prblby we should
// stick to ValueOptional types rather KeyOptional
const example1 : KeyOptional = {}

// ❌  WONT COMPILE - So prefer to specification
// const example2: ValueOptional = {}
