import { visitParents } from 'unist-util-visit-parents';
const tree = { type: 'root', children: [{ type: 'p', children: [{ type: 'text', value: 'hi' }]}]};
visitParents(tree, 'text', (...args) => {
  console.log("ARGS:", args.length, Array.isArray(args[1]));
});
