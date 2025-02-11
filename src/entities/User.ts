import { IsEmail, IsNotEmpty, Length, IsEnum } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany, UpdateDateColumn, BeforeInsert } from "typeorm";
import { UserRole } from "../enums/UserRole"
import { Session } from "./Session";
import { hash } from "bcrypt";
import { EmailVerification } from "./emailVerification"
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    @IsNotEmpty()
    name!: string

    @Column({ unique: true })
    @IsEmail()
    email!: string

    @Column()
    @Length(70) // could vary save a hash
    password!: string

    @Column({ 
         type: 'enum',
         enum: UserRole,
         default: UserRole.USER
     })
    @IsEnum(UserRole)
    role!: UserRole

    @Column({ nullable: true })
    description?: string

    @Column({ nullable: true })
    logoUrl?: string

    @Column({ nullable: true })
    walletAddress?: string

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await hash(this.password, 10);
        }
    }
    @Column({ default: false })
    isEmailVerified!: boolean;
  
    @OneToMany(() => EmailVerification, (emailVerification) => emailVerification.user)
    emailVerifications!: EmailVerification[];

    @OneToMany(() => Session, (session) => session.user)
    sessions!: Session[];

    @Column({ default: false })
    isWalletVerified!: boolean

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}