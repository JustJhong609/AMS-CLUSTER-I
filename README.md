# ALS CLUSTER I MAPPING SYSTEM

This repository contains an Ionic-based ALS mapping app focused on **potential learner mapping** across **ALS Bukidnon Cluster I**.

## Coverage Scope

This project is configured to include all barangays under:

- Libona
- Manolo Fortich
- Baungon
- Malitbog

## Tech Stack

- Ionic React
- React + TypeScript
- Vite

## Project Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser at:

```text
http://localhost:8100
```

## Supabase Authentication Setup

Authentication now uses Supabase Auth.

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Set these variables in `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. In Supabase Auth settings, enable Email/Password provider.

## Coverage Data Source

Cluster I municipality and barangay coverage is maintained in:

```text
src/data/clusterCoverage.ts
```

## Notes

- App title is set to **ALS CLUSTER I MAPPING SYSTEM**.
- The app is intended for potential learner mapping.
- Municipality cards and barangay totals are automatically computed from the coverage data file.
- Learner records are empty by default and are created through **Add New Learner** registration flow.

## Custom License

Custom Non-Commercial Restricted License
Version 1.0

Copyright (c) 2026 Just Jhong
All Rights Reserved.

1. DEFINITIONS
"Software" refers to all source code, files, documentation, and associated materials contained in this repository.

2. GRANT OF RIGHTS
No rights or licenses are granted to any individual or entity to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the Software without prior explicit written permission from the Author.

3. PERMITTED USE
Access to the Software is provided for viewing and reference purposes only.
Any intention to use, reproduce, or adapt the Software requires formal authorization from the Author.

4. RESTRICTIONS
The following actions are strictly prohibited without prior written consent from the Author:
- Copying or reproducing the Software in whole or in part
- Modifying or creating derivative works
- Redistributing the Software
- Using the Software for commercial or non-commercial purposes

5. PERMISSION REQUESTS
To request permission, you must contact the Author directly:
[Insert your email or contact details here]

Permission may be granted or denied at the sole discretion of the Author.

6. INTELLECTUAL PROPERTY
The Software remains the exclusive property of the Author. This License does not transfer any ownership rights.

7. TERMINATION
Any unauthorized use of the Software automatically terminates any implied rights and may result in legal action.

8. LIABILITY
The Software is provided "as is" without warranty of any kind, express or implied. The Author shall not be liable for any damages arising from its use.

9. GOVERNING LAW
This License shall be governed and interpreted in accordance with the laws of the Republic of the Philippines.

