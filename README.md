# Deal or No Deal Object Tracking System

This application is a client-side webcam automation system designed to track the movement of objects in the game "Deal or No Deal." Utilizing computer vision techniques, the system leverages optical flow to detect and follow the motion of objects in real-time through a webcam feed.

## Overview

The primary goal of this application is to automate the tracking of objects, such as the briefcases in "Deal or No Deal," by analyzing video input from a webcam. This is achieved using optical flow, a method that calculates the motion of objects between consecutive frames in a video sequence.

### Approach

- **Optical Flow**: The application employs optical flow algorithms to estimate the motion of objects. Optical flow works by detecting changes in pixel intensities between frames, allowing the system to infer the direction and speed of moving objects.

- **Real-Time Processing**: By processing video frames in real-time, the system can provide immediate feedback on object positions, making it suitable for interactive applications like game automation.

- **OpenCV.js**: The application is built using OpenCV.js, a powerful computer vision library that runs in the browser. This allows for efficient image processing and analysis directly on the client side without the need for server-side computation.

This project aims to demonstrate the capabilities of modern web technologies in implementing sophisticated computer vision tasks, providing a foundation for further enhancements and applications in game automation and beyond.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
