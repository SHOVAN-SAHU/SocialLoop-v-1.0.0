import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    input.username = input.username.toLowerCase().trim();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://socialloop-server.onrender.com/api/v1/users/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setInput({
          username: "",
          email: "",
          password: "",
        });
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
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
            <h1 className="font-bold">Register</h1>
            <p>Create a new account</p>
          </div>

          <div className="w-full">
            <Label className="text-sm">Username</Label>
            <Input
              type="text"
              name="username"
              value={input.username}
              className="focus-visible:ring-transparent h-8 w-f"
              onChange={handleChange}
            />
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
              Register
            </Button>
          )}
          <span className="text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-700 cursor-pointer hover:underline"
            >
              Login
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Signup;
