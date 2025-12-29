import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,  
  ) {}


  async register(name: string, email: string, password: string) {
    const existingUser = await this.isUserExists(email);
      if (existingUser)   throw new ConflictException(`Пользователь с email "${email}" уже существует`);
    const hashed = await bcrypt.hash(password, 10);                                   // хеширую пароль с солью 10
        const user = this.usersRepository.create({ name, email, password: hashed });  // создаю объект user на основании "User"
        return this.usersRepository.save(user);                                       // сохраняем user в БД
  }


  async login(email: string, password: string) {
    const user = await this.isUserExists(email)
    if (!user) throw new ConflictException(`Неверный логин или пароль !`);
        const match = await bcrypt.compare(password, user.password); // сраваниаем пароли
   
        if (!match) new ConflictException(`Неверный логин или пароль`);

          const userWithTickets = await this.usersRepository.findOne({
            where: { id: user.id },
            relations: ['tickets'],
          });
          console.log('Поиск билетов !')
          return userWithTickets
  }


  // Функция нахождения пользователя в БД (убрал дублирование в 2-ух местах)
  private async isUserExists(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user
  }



  // СЕРВИС ТЕСТОВЫЙ
  // ЛУЧШЕ СДЕЛАТЬ 2 ЗАПРОСА (под USER и пол его TICKETS)
  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });
  } 

  async findAll() {
    return this.usersRepository.find();
  }

}
