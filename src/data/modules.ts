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
  { id: 'branching', number: 4, title: 'Wonder & Flow', desc: 'Discover how wonder opens the door to flow and meaningful moments.', path: '/module/wonder' },
  { id: 'ideate', number: 5, title: 'Build a Personal Compass', desc: 'Define coherence, write your current story, and identify your Compass Values.', path: '/module/compass' },
];

export function getModuleById(id?: string) {
  return modules.find((mod) => mod.id === id);
}
