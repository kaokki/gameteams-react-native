import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacityProps } from "react-native";
import { ButtonIconTypeStyleProps, Container, Icon } from "./styles";

type Props = TouchableOpacityProps & {
  type?: ButtonIconTypeStyleProps;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export function ButtonIcon({ icon, type = 'PRIMARY', ...rest }: Props) {
  return (
    <Container {...rest}>

      <Icon type={type} name={icon} />
    </Container>
  );
}