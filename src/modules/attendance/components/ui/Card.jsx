const Card = ({ children, className = '', onClick, ...rest }) => {
  return (
    <div
      className={`bg-white dark:bg-servicenow-light rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-servicenow-dark ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
