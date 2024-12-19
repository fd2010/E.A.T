# E.A.T Database

## Overview
Database configuration and schemas for the Energy Analysis Tool project.

## Technology
- ...

## Schema Definitions

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  role: Enum['admin', 'facility_manager', 'line_manager', 'user'],
  lastLogin: Date
}
