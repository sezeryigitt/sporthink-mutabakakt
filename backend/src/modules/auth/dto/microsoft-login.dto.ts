import { IsJWT } from 'class-validator';

export class MicrosoftLoginDto {
  @IsJWT()
  id_token!: string;
}
