
type ProjectField =
  'frontend' | 'backend';

type SomeWord = 'engineer' | 'developer' | 'programmer';

type SomeTemplateLiteralType = `${ProjectField} - ${SomeWord}`


/**
 * @param name will accept only params like:
 * 'frontend programme' or 'backend developer'
 * and also give autocomplete option
 */
function someFunction(name: SomeTemplateLiteralType) {
  return null;
}
