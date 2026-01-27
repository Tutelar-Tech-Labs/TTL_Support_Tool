const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  ...props 
}) => {
  // Using Tailwind utility classes. Ensure 'primary-600' is defined or replace with standard colors
  // I will replace custom colors with standard Tailwind colors to ensure it works without custom config
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "bg-white text-gray-800 border-2 border-gray-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50",
    outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
  };

  const baseStyles = "transition-all duration-200 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center";
  const sizes = "px-6 py-2.5";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
