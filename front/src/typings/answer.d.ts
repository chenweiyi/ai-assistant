declare namespace Answer {
  export type answer = {
    type: 'question' | 'answer' | 'loading';
    ownerId: string;
    ownerName: string;
    content: string;
    id: string;
  };
}
