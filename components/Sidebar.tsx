import React from 'react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const menuItems = [
    { icon: 'fa-regular fa-id-card', label: '个人信息', id: 'Profile' },
    { icon: 'fa-solid fa-layer-group', label: '参与作品', id: 'Projects' },
    { icon: 'fa-solid fa-chart-pie', label: '技能分析', id: 'Skills' },
  ];

  const contactMethods = [
    { icon: 'fa-brands fa-github', label: 'GitHub', value: 'github.com/yuweiming' },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: 'yuweiming@gmail.com' },
    { icon: 'fa-brands fa-weixin', label: 'WeChat', value: 'yuweiming_wx' },
    { icon: 'fa-solid fa-phone', label: 'Phone', value: '17607210929' },
  ];

  return (
    <aside className="w-64 h-full bg-[#1c1c1e]/95 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex">
      {/* User Profile (Moved to Top) */}
      <div className="px-5 py-8 mb-2">
        <div className="flex items-center space-x-3 cursor-pointer group p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-blue to-purple-500 flex items-center justify-center text-sm font-bold ring-2 ring-[#1c1c1e] shrink-0">
            ME
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-gray-200 group-hover:text-white transition-colors truncate">余炜铭</div>
            <div className="text-xs text-gray-500 truncate">查看详情</div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 
              ${activeView === item.id 
                ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className={`${item.icon} w-5 text-center text-lg`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Contact Section (Replaces Version) */}
      <div className="p-5 border-t border-white/5">
        <div className="flex justify-between items-center px-1">
          {contactMethods.map((contact, index) => (
            <div key={index} className="group relative">
              <button className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <i className={`${contact.icon} text-lg`}></i>
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10">
                <span className="font-semibold text-gray-400 mr-1">{contact.label}:</span>
                {contact.value}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;