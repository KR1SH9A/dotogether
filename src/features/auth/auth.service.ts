import { EntityManager } from "@mikro-orm/postgresql";
import { User } from "./User.entity.js";
import bcrypt from "bcrypt";
import { AppError } from "../../common/errors/AppError.js";
import crypto from "crypto";
import { Session } from "./Session.entity.js";

export class AuthService {
  constructor(private em: EntityManager) {}

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }

  //Register a new user
  async register(email: string, password: string, username: string) {
    const existing = await this.em.findOne(User, { email });
    if (existing) {
      throw new AppError("User already exists", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.passwordHash = hashedPassword;
    user.username = username;

    const session = new Session();
    session.id = crypto.randomUUID();
    session.user = user;

    this.em.persist(user);
    this.em.persist(session);
    await this.em.flush();

    return {
      sessionId: session.id,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  //for login with basic session creation for now
  async login(email: string, password: string) {
    const user = await this.em.findOne(User, { email });

    if (!user) {
      throw new AppError("User doesn't exist or wrong password/email", 401);
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new AppError("Oops! Password doesn't match.", 401);
    }

    const session = new Session();
    session.id = crypto.randomUUID();
    session.user = user;

    this.em.persist(session);
    await this.em.flush();

    return {
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  //logout with basic session
  async logout(sessionId: string) {
    const session = await this.em.findOne(Session, { id: sessionId });

    if (!session) return;

    this.em.remove(session);
    await this.em.flush();
  }

  //update profile
  async updateProfile(userId: number, input: { username?: string }) {
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new AppError("Oops! user does not exist", 404);
    }
    if (input.username !== undefined) {
      user.username = input.username;
    }

    await this.em.flush();

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
