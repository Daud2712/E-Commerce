# Contributing to E-Commerce Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/E-Commerce.git
cd E-Commerce
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Daud2712/E-Commerce.git
```

### 4. Setup Development Environment

Follow the [Quick Start Guide](QUICKSTART.md) to set up your local environment.

## 💻 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test

# Manual testing
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to your fork on GitHub
- Click "Compare & pull request"
- Fill in the PR template
- Link related issues

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Use meaningful variable names
- Prefer `const` over `let`, avoid `var`
- Use async/await instead of promises chains
- Add JSDoc comments for functions

```typescript
/**
 * Fetches user orders from the database
 * @param userId - The ID of the user
 * @returns Array of orders
 */
async function getUserOrders(userId: string): Promise<IOrder[]> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful component names

```tsx
// Good
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return <Card>...</Card>;
};

// Bad
const Comp = (props) => {
  return <div>...</div>;
};
```

### File Organization

```
backend/src/
├── controllers/    # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Express middleware
├── utils/          # Utility functions
└── types.ts        # Type definitions

frontend/src/
├── components/     # Reusable components
├── pages/          # Page components
├── context/        # React contexts
├── services/       # API services
├── locales/        # Translations
└── types.ts        # Type definitions
```

### API Design

- Use RESTful conventions
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response formats
- Include proper error messages

```typescript
// Success response
{
  "data": { ... },
  "message": "Success message"
}

// Error response
{
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

## 📋 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(products): add product image upload functionality

fix(auth): resolve JWT token expiration issue

docs(readme): update installation instructions

refactor(orders): simplify order creation logic

test(deliveries): add unit tests for delivery controller
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines
- [ ] No console.log() or debugging code
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. Maintainer will review within 2-3 days
2. Address feedback in new commits
3. Once approved, squash and merge
4. Delete your branch after merge

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# Watch mode
npm run test:watch
```

### Manual Testing Checklist

- [ ] All user roles work correctly
- [ ] CRUD operations function properly
- [ ] Real-time updates work
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] Works in different browsers

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing APIs
- Updating dependencies
- Fixing bugs (if it affects usage)
- Improving setup process

### Documentation Files

- `README.md` - Main project documentation
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment instructions
- `CONTRIBUTING.md` - This file
- Code comments - For complex logic

### API Documentation

If adding/changing API endpoints, update:

```typescript
/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Seller only)
 * @param   {Object} req.body - Product data
 * @returns {Object} Created product
 */
```

## 🎨 UI/UX Guidelines

- Follow existing design patterns
- Maintain consistent spacing and colors
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on different screen sizes
- Provide loading states
- Show meaningful error messages

## 🐛 Reporting Bugs

### Before Reporting

- Search existing issues
- Try latest version
- Check documentation

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node version: [e.g., 18.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Screenshots, mockups, etc.
```

## 🏆 Recognition

Contributors will be:
- Listed in the Contributors section
- Mentioned in release notes
- Acknowledged in the project

## 📞 Getting Help

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: For private concerns

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

Thank you for contributing to E-Commerce Platform! 🎉

Your contributions help make this project better for everyone.
