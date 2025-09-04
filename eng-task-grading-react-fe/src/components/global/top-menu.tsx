import { Link } from '@tanstack/react-router';

const TopMenu: React.FC = () => {

    return (
    <>
        <nav className="p-4 bg-gray-100">
            <Link to="/home" className="mr-4 text-blue-600">Home</Link>
            <Link to="/courses" className="mr-4 text-blue-600">Kurzy</Link>
            <Link to="/login" className="mr-4 text-blue-600">Login</Link>
            <Link to="/register" className="text-blue-600">Registrace</Link>
            <Link to="/logs" className="ml-4 text-blue-600">App-Log</Link>

        </nav>
    </>);
}


export default TopMenu;