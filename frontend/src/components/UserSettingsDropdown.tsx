import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UserSettingsDropdownProps {
  onLogout: () => void;
}

const UserSettingsDropdown: React.FC<UserSettingsDropdownProps> = ({ onLogout }) => {
  const { t } = useTranslation();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" id="user-settings-dropdown" className="text-white text-decoration-none">
        ⚙️
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/settings">
          {t('settings_title')}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogout}>
          {t('logout_button')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserSettingsDropdown;
