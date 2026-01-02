import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,  
    private jwtService: JwtService
  ) {}


  async register(name: string, email: string, password: string) {
    const existingUser = await this.isUserExists(email);
      if (existingUser)   throw new ConflictException(`Пользователь с email "${email}" уже существует`);

    const hashed = await bcrypt.hash(password, 10);                                   // хеширую пароль с солью 10
      const user = this.usersRepository.create({ name, email, password: hashed });    // создаю объект user на основании "User"

      const savedUser = await this.usersRepository.save(user)
      const token = this.generateToken(savedUser);

      return { 
        user: savedUser, 
        token 
      };                                      
  }


  async login(email: string, password: string) {
    console.log(email, password, 'ДАННЫЕ ДЛЯ ВХОДА')
    const user = await this.isUserExists(email)
    if (!user) throw new ConflictException(`Неверный логин или пароль !`);
        const match = await bcrypt.compare(password, user.password); // сраваниаем пароли
   
    if (!match) new ConflictException(`Неверный логин или пароль`);
        const userWithTickets = await this.usersRepository.findOne({
          where: { id: user.id },
          relations: ['tickets'],
        });

        const token = this.generateToken(userWithTickets!); // генерируем токен

        return {
          user: userWithTickets,
          token,
        };
  }


  
  // Функция нахождения пользователя в БД (убрал дублирование в 2-ух местах)
  private async isUserExists(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user
  }

  // Функция генерации токена
  private generateToken(user: User): string {
    const payload = { email: user.email, id: user.id };
    return this.jwtService.sign(payload); // теперь это просто строка
  }

}
