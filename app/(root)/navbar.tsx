import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Image
                src="/logos/search.png"
                alt="Search Icon"
                width={16}
                height={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Recherche"
                className="pl-10 pr-4 py-2 rounded-3xl bg-[#F5F7FA] text-[#8BA3CB] focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Right Side: Icons and Profile */}
          <div className="flex items-center space-x-4">
            <Image src="/logos/email.png" alt="E-mail" width={40} height={40} />
            <Image src="/logos/notif.png" alt="Notifications" width={40} height={40} />
            <Image
              src="/images/profile.png"
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full border-2 border-gray-300"
            />
          </div>

          {/* Mobile Menu (Hidden by Default) */}
          <div className="md:hidden">
            {/* You can add a hamburger menu here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
