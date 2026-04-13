export type ModuleInfo = {
  id: string;
  number: number;
  title: string;
  desc: string;
  path: string;
};

export const modules: ModuleInfo[] = [
  { id: 'intro', number: 1, title: 'Meaning as Design', desc: 'See meaning as something you can actively design.', path: '/module/intro' },
  { id: 'reframe', number: 2, title: 'Reframe Meaning & Purpose', desc: 'Examine three common beliefs and see meaning differently.', path: '/module/reframe' },
  { id: 'observe', number: 3, title: 'Meaning Design: Flip the World Switch', desc: 'Learn to move between two worlds and design your first meaningful moment.', path: '/module/meaning' },
  { id: 'branching', number: 4, title: 'Ideate Meaning Experiments', desc: 'Generate small directions to increase meaning.', path: '/module/branching' },
  { id: 'ideate', number: 5, title: 'Build a Prototype', desc: 'Turn one idea into a testable real-life prototype.', path: '/module/ideate' },
  { id: 'prototype', number: 6, title: 'Rapid Test', desc: 'Test fast, gather evidence, and reflect.', path: '/module/prototype' },
  { id: 'test', number: 7, title: 'Move Forward with a Meaning Design Plan', desc: 'Choose next steps and continue iterating.', path: '/reflection/test' },
];

export function getModuleById(id?: string) {
  return modules.find((mod) => mod.id === id);
}
