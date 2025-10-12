export interface ICreateBoard {
  name: string;
  sharedUserIds?: string[];
}

export interface IUpdateBoard {
  name?: string;
  sharedUserIds?: string[];
}
