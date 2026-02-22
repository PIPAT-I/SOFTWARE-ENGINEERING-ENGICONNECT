import type{ ComponentType } from 'react';
import {Suspense} from 'react';


const LoadingScreen = () => (
  <div className="flex justify-center items-center h-full min-h-[200px] p-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <span className="ml-2">กำลังโหลด...</span>
  </div>
);
export const Loadable = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};