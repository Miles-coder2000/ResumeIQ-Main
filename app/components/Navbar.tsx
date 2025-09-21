import {Link} from "react-router";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">ResumèIQ</p>
            </Link>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </div>
        </nav>
    )
}
export default Navbar
