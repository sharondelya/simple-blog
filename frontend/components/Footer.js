const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">SimpleBlog</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A modern blogging platform built for writers and readers who value simplicity and elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="/" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Home
              </a>
              <a href="/complaint" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Report Issue
              </a>
              <a href="/register" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Join Us
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-white mb-4">Built With</h4>
            <div className="flex flex-wrap justify-center md:justify-end gap-2 text-xs">
              <span className="bg-blue-600 px-2 py-1 rounded">Next.js</span>
              <span className="bg-green-600 px-2 py-1 rounded">Node.js</span>
              <span className="bg-purple-600 px-2 py-1 rounded">MongoDB</span>
              <span className="bg-cyan-600 px-2 py-1 rounded">Tailwind</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SimpleBlog. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <p className="text-gray-400 text-sm flex items-center">
                Made with
                <span className="text-red-500 mx-1 animate-pulse">❤️</span>
                by developers who care
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;