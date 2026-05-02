# Kashf.ai — Project Instructions

## Overview
Kashf.ai is a privacy-first health decision-support web application.

It helps users:
- understand symptom urgency
- decide next steps (self-care, GP, emergency)
- see the broader impact of delayed care
- generate a structured report for clinicians

## Core Principles
- This is NOT a medical diagnosis tool
- All outputs must be framed as guidance or observations
- Prioritize clarity, accessibility, and safety
- Keep the MVP simple and demoable
- Prefer working features over complex architecture

## Features (MVP)
1. Symptom input (with severity and duration)
2. Risk scoring (low, moderate, urgent)
3. Red flag escalation (emergency warning)
4. Results dashboard
5. "What this could mean for you" section
6. Downloadable Care & Cost report (PDF)

## Optional Enhancements
- Facial wellness scan (MediaPipe)
- Wearable demo data
- Voice symptom input
- Accessibility improvements

## Safety Requirements
Always include:
- "This is not a medical diagnosis"
- Emergency warnings for red flag symptoms
- Conservative recommendations

Never:
- claim certainty
- diagnose conditions
- give medical treatment instructions

## Technical Stack
- React + TypeScript (Vite)
- BrowserPod (local runtime)
- MediaPipe (facial landmarks)
- jsPDF (report generation)

## Judging Criteria Focus
- Creativity and innovation
- Technical sophistication
- Social and global impact
- Accessibility
- Healthcare safety
- Privacy and security

## Goal
Deliver a clean, working demo that clearly shows:
- user input → decision → explanation → report