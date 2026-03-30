const Loading = ({ fullScreen = false, size = 'large' }) => {
  const sizes = {
    small: 'h-8 w-8 border-2',
    medium: 'h-12 w-12 border-3',
    large: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className={`animate-spin rounded-full ${sizes[size]} border-t-primary-600 border-b-primary-600 border-l-transparent border-r-transparent`}></div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default Loading;
