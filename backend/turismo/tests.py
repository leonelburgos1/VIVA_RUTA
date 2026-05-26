from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class UserAuthFlowTests(APITestCase):
    def test_user_registration_login_update_and_delete_flow(self):
        register_payload = {
            'name': 'Camila Rojas',
            'email': 'camila@example.com',
            'password': 'secreta123',
            'role': 'usuario',
            'phone': '3001234567',
            'birthDate': '1998-07-11',
            'department': 'Antioquia',
            'city': 'Medellín'
        }

        register_response = self.client.post(reverse('users-list'), register_payload, format='json')

        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register_response.data['email'], 'camila@example.com')
        self.assertEqual(register_response.data['name'], 'Camila Rojas')
        self.assertEqual(register_response.data['role'], 'usuario')
        self.assertEqual(register_response.data['birthDate'], '1998-07-11')
        self.assertNotIn('password', register_response.data)

        token_response = self.client.post(
            reverse('token_obtain_pair'),
            {'email': 'camila@example.com', 'password': 'secreta123'},
            format='json'
        )

        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        access_token = token_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        profile_response = self.client.get(reverse('users-detail', kwargs={'pk': register_response.data['id']}), format='json')

        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['city'], 'Medellín')

        update_response = self.client.patch(
            reverse('users-detail', kwargs={'pk': register_response.data['id']}),
            {'name': 'Camila Rojas Perez', 'city': 'Envigado'},
            format='json'
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['name'], 'Camila Rojas Perez')
        self.assertEqual(update_response.data['city'], 'Envigado')

        delete_response = self.client.delete(reverse('users-detail', kwargs={'pk': register_response.data['id']}), format='json')

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
