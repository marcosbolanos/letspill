import { useState, useRef, useEffect } from 'react';
import { Modal, StyleSheet, Pressable, View, Text, FlatList, ScrollView, TextInput, GestureResponderEvent, Animated } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  usePostAccessInvite,
  useGetAccessOutgoingGrants,
  usePutAccessRevokeGrant,
  useGetAccessIncomingInvites,
  usePutAccessApproveInvite,
  usePutAccessIgnoreInvite
} from '@/api/orval/access/access';

interface BlistersModalProps {
  onRequestClose: (event: GestureResponderEvent) => void;
  visible?: boolean;
}

interface AccessGrant {
  id: string;
  ownerId: string;
  granteeId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  granteeUsername: string | null;
}

interface IncomingInvite {
  id: string;
  ownerId: string;
  inviteeId: string;
  status: 'pending' | 'approved' | 'revoked' | 'ignored';
  createdAt: string;
  updatedAt: string;
  ownerUsername: string | null;
}

const BlistersModal = ({ onRequestClose, visible = true }: BlistersModalProps) => {
  const [inviteUsername, setInviteUsername] = useState('');
  const [showInviteAlert, setShowInviteAlert] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const postInviteMutation = usePostAccessInvite();
  const { data: grants = [], refetch: refetchGrants } = useGetAccessOutgoingGrants();
  const { data: incomingInvites, refetch: refetchIncoming } = useGetAccessIncomingInvites();
  const revokeGrantMutation = usePutAccessRevokeGrant();
  const approveInviteMutation = usePutAccessApproveInvite();
  const ignoreInviteMutation = usePutAccessIgnoreInvite();

  const pendingInvites = incomingInvites?.pending || [];
  const approvedInvites = incomingInvites?.approved || [];

  useEffect(() => {
    if (showInviteAlert) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Fade out after 500ms
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowInviteAlert(false);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showInviteAlert, fadeAnim]);

  const handleInvite = () => {
    if (inviteUsername.trim()) {
      postInviteMutation.mutate(
        { params: { username: inviteUsername.trim() } },
        {
          onSuccess: () => {
            setInviteUsername('');
            refetchGrants();
            setShowInviteAlert(true);
          },
        }
      );
    }
  };

  const handleRevokeGrant = (userId: string) => {
    revokeGrantMutation.mutate(
      { params: { userId } },
      {
        onSuccess: () => {
          refetchGrants();
        },
      }
    );
  };

  const handleApproveInvite = (userId: string) => {
    approveInviteMutation.mutate(
      { params: { userId } },
      {
        onSuccess: () => {
          refetchIncoming();
        },
      }
    );
  };

  const handleIgnoreInvite = (userId: string) => {
    ignoreInviteMutation.mutate(
      { params: { userId } },
      {
        onSuccess: () => {
          refetchIncoming();
        },
      }
    );
  };

  const renderPendingInvite = ({ item }: { item: IncomingInvite }) => {
    return (
      <View style={styles.inviteItem}>
        <Text style={styles.inviteUsernameText}>{item.ownerUsername || item.ownerId}</Text>
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.approveButton}
            onPress={() => handleApproveInvite(item.ownerId)}
          >
            <AntDesign name="check" size={20} color="green" />
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleIgnoreInvite(item.ownerId)}
          >
            <AntDesign name="close" size={20} color="red" />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderApprovedInvite = ({ item }: { item: IncomingInvite }) => {
    return (
      <View style={styles.inviteItem}>
        <Text style={styles.inviteUsernameText}>{item.ownerUsername || item.ownerId}</Text>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleIgnoreInvite(item.ownerId)}
        >
          <AntDesign name="close" size={20} color="black" />
        </Pressable>
      </View>
    );
  };

  const renderGrant = ({ item }: { item: AccessGrant }) => {
    return (
      <View style={styles.inviteItem}>
        <Text style={styles.inviteUsernameText}>{item.granteeUsername || item.granteeId}</Text>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleRevokeGrant(item.granteeId)}
        >
          <AntDesign name="close" size={20} color="black" />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.outerView}>
        <View style={styles.innerView}>
          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <AntDesign name="close" size={24} color="black" />
          </Pressable>
          <Text style={styles.titleText}>
            Blisters
          </Text>
          <Text style={styles.subtitleText}>
            Who I can view
          </Text>
          <ScrollView style={styles.scrollSection}>
            {pendingInvites.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Pending</Text>
                <FlatList
                  data={pendingInvites}
                  renderItem={renderPendingInvite}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  scrollEnabled={false}
                />
              </>
            )}
            {approvedInvites.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Accepted</Text>
                <FlatList
                  data={approvedInvites}
                  renderItem={renderApprovedInvite}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  scrollEnabled={false}
                />
              </>
            )}
            {pendingInvites.length === 0 && approvedInvites.length === 0 && (
              <Text style={styles.emptyText}>No invites yet</Text>
            )}
          </ScrollView>
          <Text style={styles.subtitleText}>
            Who can view me
          </Text>
          <View style={styles.inviteContainer}>
            <TextInput
              style={styles.inviteInput}
              placeholder="Enter username"
              value={inviteUsername}
              onChangeText={setInviteUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable style={styles.sendButton} onPress={handleInvite}>
              <AntDesign name="send" size={20} color="black" />
            </Pressable>
          </View>
          <FlatList
            data={grants as AccessGrant[]}
            renderItem={renderGrant}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No one can view you yet</Text>
            }
          />
        </View>
      </View>
      {showInviteAlert && (
        <Animated.View style={[styles.floatingAlert, { opacity: fadeAnim }]}>
          <Text style={styles.floatingAlertText}>If the user exists, they received your invite</Text>
        </Animated.View>
      )}
    </Modal>
  );
};

export default BlistersModal;

const styles = StyleSheet.create({
  outerView: {
    margin: 38
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    paddingHorizontal: 10
  },
  innerView: {
    borderRadius: 30,
    backgroundColor: "white",
    height: 800,
    padding: 38,
    outlineStyle: "solid",
    outlineWidth: 3,
    outlineColor: "black"
  },
  titleText: {
    marginTop: 20,
    fontFamily: "Inter 18pt Black",
    fontWeight: 800,
    textAlign: "center",
    fontSize: 25,
    marginBottom: 40
  },
  contentText: {
    padding: 10,
    fontSize: 16,
    textAlign: "center"
  },
  closeButton: {
    marginLeft: "auto",
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  scrollSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    color: '#666',
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'beige',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    marginHorizontal: 10,
  },
  inviteInput: {
    flex: 1,
    fontSize: 16,
    outline: 'none',
    minWidth: 0,
  },
  sendButton: {
    marginLeft: 10
  },
  inviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'beige',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inviteUsernameText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  floatingAlert: {
    position: 'absolute',
    bottom: 50,
    left: 60,
    right: 60,
    backgroundColor: 'palegreen',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingAlertText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  }
});
