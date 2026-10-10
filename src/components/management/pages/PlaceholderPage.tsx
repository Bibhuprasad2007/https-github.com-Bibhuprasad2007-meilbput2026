import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
      <p className="text-slate-600">This page is under construction. Stay tuned for upcoming features.</p>
    </div>
  );
};
