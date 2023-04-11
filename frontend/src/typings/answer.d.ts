declare namespace Answer {
  export type answer = 
  | {
    type: 'answer';
    ownerId: string;
    ownerName: string;
    content: string;
    id: string;
    error: boolean;
  }
  | {
    type: 'question';
    ownerId: string;
    ownerName: string;
    content: string;
    id: string;
  }
  | {
    type: 'loading';
    content: string;
    id: string;
  }
}
