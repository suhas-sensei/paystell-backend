import { Repository } from 'typeorm';
import AppDataSource from '../config/db';
import { User } from '../entities/User';
import { validate } from 'class-validator';
import { CreateUserDTO } from '../dtos/CreateUserDTO';
import { UpdateUserDTO } from '../dtos/UpdateUserDTO';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const dto = Object.assign(new CreateUserDTO(), data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new Error(errors.map(err => Object.values(err.constraints || {})).join(', '));
    }
    
    const existingUser = await this.userRepository.findOneBy({ email: data.email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = this.userRepository.create(data);
    return await this.userRepository.save(newUser);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, data);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
  }
}