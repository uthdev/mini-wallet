import { validate } from 'class-validator';
import { RegisterInput } from './register.input';

describe('RegisterInput', () => {
  let input: RegisterInput;

  beforeEach(() => {
    input = new RegisterInput();
  });

  it('should be defined', () => {
    expect(input).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      input.email = 'test@example.com';
      input.password = 'Password123';
      input.name = 'Test User';

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      input.email = 'invalid-email';
      input.password = 'Password123';
      input.name = 'Test User';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with weak password', async () => {
      input.email = 'test@example.com';
      input.password = 'weak';
      input.name = 'Test User';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with short name', async () => {
      input.email = 'test@example.com';
      input.password = 'Password123';
      input.name = 'A';

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with long name', async () => {
      input.email = 'test@example.com';
      input.password = 'Password123';
      input.name = 'A'.repeat(51);

      const errors = await validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });
  });
});