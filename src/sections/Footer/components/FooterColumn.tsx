export type FooterColumnItem = {
  label: string;
  href: string;
  hasDivider?: boolean;
};

export type FooterColumnProps = {
  title: string;
  items: FooterColumnItem[];
};

export const FooterColumn = (props: FooterColumnProps) => {
  return (
    <div>
      <h3 className="text-black text-sm font-medium leading-5 mb-4">
        {props.title}
      </h3>

      <ul className="text-sm leading-5 list-none pl-0 m-0">
        {props.items.map((item, index) => (
          <li
            key={index}
            className={item.hasDivider ? "mb-2.5" : ""}
          >
            <a
              href={item.href}
              className="hover:text-black transition-colors duration-150"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
