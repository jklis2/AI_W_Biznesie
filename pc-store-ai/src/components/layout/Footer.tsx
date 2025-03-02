export default function Footer() {
  const renderSmallFooter = () => (
    <div className="w-full border-t-neutral-200 border-t-1">
      <div className="flex items-center justify-between p-5 w-4/5 mx-auto">
        <p className="text-left text-neutral-600">Copyright 2025 PC Store AI.</p>
        <div className="flex space-x-4">
          <p className="whitespace-nowrap text-neutral-900">Terms of Service</p>
          <p className="whitespace-nowrap text-neutral-900">Privacy Policy</p>
        </div>
      </div>
    </div>
  );

  // ToDo: Finish logic of this bigFooter. It should contain for ex. About us, contact etc
  const renderBigFooter = () => <></>;

  return (
    <footer className="w-full">
      {renderBigFooter()}
      {renderSmallFooter()}
    </footer>
  );
}
