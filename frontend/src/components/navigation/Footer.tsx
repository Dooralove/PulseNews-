import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colors, spacing, typography } from '../../theme/designTokens';
import { Container } from '../layout';
import { Caption } from '../ui/Typography';

export const Footer: React.FC = () => {
  const footerStyles: React.CSSProperties = {
    backgroundColor: colors.neutral.gray900,
    color: colors.neutral.white,
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
    marginTop: 'auto',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing[8],
    marginBottom: spacing[8],
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[4],
    color: colors.neutral.white,
  };

  const linkListStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const linkItemStyles: React.CSSProperties = {
    marginBottom: spacing[2],
  };

  const linkStyles: React.CSSProperties = {
    color: colors.neutral.gray300,
    textDecoration: 'none',
    fontSize: typography.fontSize.sm,
    transition: 'color 200ms',
  };

  const dividerStyles: React.CSSProperties = {
    borderTop: `1px solid ${colors.neutral.gray700}`,
    paddingTop: spacing[6],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[4],
  };

  return (
    <footer style={footerStyles}>
      <Container>
        <div style={gridStyles}>
          {/* About Section */}
          <div>
            <h3 style={sectionTitleStyles}>О нас</h3>
            <ul style={linkListStyles}>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>О проекте</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Наша команда</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Контакты</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 style={sectionTitleStyles}>Категории</h3>
            <ul style={linkListStyles}>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Политика</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Технологии</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Спорт</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Бизнес</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={sectionTitleStyles}>Правовая информация</h3>
            <ul style={linkListStyles}>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Политика конфиденциальности</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Условия использования</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Cookies</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 style={sectionTitleStyles}>Социальные сети</h3>
            <ul style={linkListStyles}>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Facebook</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Twitter</a>
              </li>
              <li style={linkItemStyles}>
                <a href="#" style={linkStyles}>Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        <div style={dividerStyles}>
          <Caption style={{ color: colors.neutral.gray400 }}>
            © {new Date().getFullYear()} PulseNews. Все права защищены.
          </Caption>
          <Caption style={{ color: colors.neutral.gray400 }}>
            Сделано с ❤️ в России
          </Caption>
        </div>
      </Container>
    </footer>
  );
};
