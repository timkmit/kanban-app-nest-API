export class CreateBoardWithColumnsDto {
    title: string;
    description?: string;
    columns: CreateColumnDto[];
  }
  
  export class CreateColumnDto {
    title: string;
    description?: string;
  }