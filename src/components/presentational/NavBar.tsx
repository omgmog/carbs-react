import React from 'react';

const NavBar: React.FC = () => {
    return (
        <nav className='navbar' role='navigation'>
            <div className="navbar-start">
                <div className="navbar-brand">
                    <div className="title">
                        <a className="navbar-item" href="https://carbs.omgmog.net">Carbs Calculator</a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar; 