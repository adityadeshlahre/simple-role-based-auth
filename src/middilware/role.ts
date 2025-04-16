const authorizRole = (...role: string[]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.user.role;

    if (!role.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export default authorizRole;
