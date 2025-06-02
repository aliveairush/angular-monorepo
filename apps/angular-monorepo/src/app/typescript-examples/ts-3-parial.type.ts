type User = {
  id: number;
  value: string;
}

/**
 * ❌
 * code duplications
 */
type PartialUserBad = {
  id?: number;
  value?: string;
}

/**
 * ✅ The same as code above
 */
type PartialUserGood = Partial<User>
