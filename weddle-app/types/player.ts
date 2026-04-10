export type Player = {
  id: string;
  name: string;
  team: string;
  conference: string;
  division: string;
  position: string;
  height: number;       // stored in total inches (e.g. 74 = 6'2")
  age: number;
  jerseyNumber: number;
  yearsInLeague: number;
};
