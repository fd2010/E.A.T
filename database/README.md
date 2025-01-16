# E.A.T Database

## Overview
Database configuration and schemas for the Energy Analysis Tool project.

## Technology
- ...

## Schema Definitions

### User Schema
```javascript
{
  email: String,
  officeID: String,
  prefName: String,
  username: String,
  password: String,
  role: Enum['admin', 'facility_manager', 'line_manager', 'user'],
  lastLogin: Date

}
```
### Structure
```javascript
users/
  {userId}/
    email: "user@example.com"
    officeID: "..."
    prefName: "..."
    username: "..."
    role: "employee/lineManager/facilityManager/systemAdmin"
    createdAt: "timestamp"
```

## Contributors
- Karan Kothari
- Yasin Tella
- Muskaan Garg
