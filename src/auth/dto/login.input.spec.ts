import 'reflect-metadata';
import { validate } from 'class-validator';
import { LoginInput } from './login.input';

describe('LoginInput', () => {
  let input: LoginInput;

  beforeEach(() => {
    input = new LoginInput();
  });

  it('should be defined', () => {
    expect(input).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      input.email = 'test@example.com';
      input.password = 'password123';

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      input.email = 'invalid-email';
      input.password = 'password123';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty password', async () => {
      input.email = 'test@example.com';
      input.password = '';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with missing email', async () => {
      input.password = 'password123';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });
  });
});