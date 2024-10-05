import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://socialloop.onrender.com/api/v1/users/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        className="shadow-lg flex flex-col gap-4 p-8 w-72 rounded-md sm:min-w-80"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-bold">Login</h1>
            <p>Login to an existed account</p>
          </div>

          <div className="w-full">
            <Label className="text-sm">Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              className="focus-visible:ring-transparent h-8 w-f"
              onChange={handleChange}
            />
          </div>
          <div className="w-full">
            <Label className="text-sm">Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              className="focus-visible:ring-transparent h-8 w-f"
              onChange={handleChange}
            />
          </div>
          {loading ? (
            <Button
              className="w-full h-9 flex gap-2 justify-center items-center"
              disabled
            >
              Please wait
              <Loader2 className="animate-spin w-5 h-5" />
            </Button>
          ) : (
            <Button className="w-full h-9" type="submit">
              Login
            </Button>
          )}
          <span className="text-sm">
            Doesn't have an account?{" "}
            <Link
              className="text-blue-700 cursor-pointer hover:underline"
              to="/register"
            >
              Register
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
