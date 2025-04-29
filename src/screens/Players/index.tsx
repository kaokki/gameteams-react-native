import { Button } from '@components/Button';
import { ButtonIcon } from '@components/ButtonIcon';
import { Filter } from '@components/Filter';
import { Header } from '@components/Header';
import { Highlight } from '@components/Highlight';
import { Input } from '@components/Input';
import { ListEmpty } from '@components/ListEmpty';
import { Loading } from '@components/Loading';
import { PlayerCard } from '@components/PlayerCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';
import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { playersGetByGroupAndTeam } from '@storage/player/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/playerStorageDTO';
import { AppError } from '@utils/AppError';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, TextInput } from 'react-native';
import { Container, Form, HeaderList, NumberOfPlayers } from './styles';

export function Players() {
  const [isLoading, setIsLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [team, setTeam] = useState('Time A');
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

  const route = useRoute();
  const { group } = route.params as { group: string };

  const newPlayerNameInputRef = useRef<TextInput>(null);

  const handleAddPlayer = async () => {
    if (newPlayerName.trim().length === 0) {
      return Alert.alert('Novo jogador', 'Informe o nome do jogador para adicionar.');
    }
    const newPlayer = {
      name: newPlayerName,
      team
    }

    try { 
      await playerAddByGroup(newPlayer, group);

      newPlayerNameInputRef.current?.blur();

      fetchPlayersByTeam();
      setNewPlayerName('');
      
    } catch (error) { 
      if(error instanceof AppError) {
        Alert.alert('Novo jogador', error.message);
      } else {
        console.log(error);
        Alert.alert('Novo jogador', 'Não foi possível adicionar o jogador.');
      }
    }
  }

  const fetchPlayersByTeam = async () => {
    try {
      setIsLoading(true);
      const playersByTeam = await playersGetByGroupAndTeam(group, team);
      setPlayers(playersByTeam);
    } catch(error) {
      console.log(error);
      Alert.alert('Jogadores', 'Não foi possível carregar os jogadores.');
    } finally {
      setIsLoading(false);
    }

  }

  const handleRemovePlayer = async (playerName: string) => {
    try {
      Alert.alert('Remover jogador', `Deseja remover o jogador ${playerName}?`, [
        {
          text: 'Sim',
          onPress: async () => {
            await playerRemoveByGroup(playerName, group);
            fetchPlayersByTeam();
          }
        },
        {
          text: 'Não',
          style: 'cancel'
        }
      ])
    } catch (error) {
      console.log(error);
      Alert.alert('Remover jogador', 'Não foi possível remover o jogador.');
    }
  }

  const navigation = useNavigation();

  const groupRemove = async () => {
    try {
      await groupRemoveByName(group);
      navigation.navigate('groups');
    } catch (error) {
      console.log(error);
      Alert.alert('Remover turma', 'Não foi possível remover a turma.');
    }
  }

  const handleGroupRemove = async () => {
    Alert.alert('Remover turma', 'Deseja remover a turma?', [
      { text: 'Sim', onPress: () => groupRemove() },
      { text: 'Não', style: 'cancel' }
    ]
  )
  }

  useEffect(() => {
    fetchPlayersByTeam();
  }, [team]);

  return (
    <Container>
      <Header showBackButton />

      <Highlight
        title={group}
        subtitle="Adicione a galera e separe os times" 
      />

      <Form>
        <Input
          inputRef={newPlayerNameInputRef}
          placeholder="Nome da Pessoa"
          autoCorrect={false}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          onSubmitEditing={handleAddPlayer}
          returnKeyType='done'
        />

        <ButtonIcon 
          icon="add" 
          onPress={handleAddPlayer}
        />
      </Form>

    <HeaderList>
      <FlatList
        data={['Time A', 'Time B']}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <Filter
            title={item}
            isActive={item === team}
            onPress={() => setTeam(item)}
          />
        )}
        horizontal
      />

      <NumberOfPlayers>{players.length}</NumberOfPlayers>

    </HeaderList>

    {isLoading ? <Loading /> : (
      <FlatList
        keyExtractor={item => item.name}
        data={players}
        renderItem={({ item }) => (
          <PlayerCard 
            name={item.name} 
            onRemove={() => handleRemovePlayer(item.name)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmpty 
            message="Não há pessoas nesse time" />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: 100 }, players.length === 0 && { flex: 1 }]}
      />
    )}


    <Button title="Remover Turma" type="SECONDARY" onPress={handleGroupRemove} />
      
    </Container>
  );
}

function playersAddByGroup(newPlayer: { name: string; team: string; }, group: string) {
  throw new Error('Function not implemented.');
}
