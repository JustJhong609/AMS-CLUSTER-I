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